import crypto from "node:crypto";
import { Router } from "express";
import bcrypt from "bcryptjs";
import rateLimit from "express-rate-limit";
import { prisma } from "../lib/prisma.js";
import { signToken, authCookieOptions } from "../lib/jwt.js";
import { requireAuth } from "../middleware/auth.js";
import { sendVerificationEmail } from "../lib/email.js";

const EMAIL_VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;

export function makeVerificationFields() {
  return {
    emailVerificationToken: crypto.randomBytes(32).toString("hex"),
    emailVerificationExpiresAt: new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS),
  };
}

// 메일 발송 실패(도메인 미인증 등)가 회원가입/재발송 자체를 막으면 안 돼서 항상 best-effort로 처리.
export async function trySendVerificationEmail(user, token) {
  try {
    await sendVerificationEmail(user, token);
  } catch (err) {
    console.error("인증 메일 발송 실패:", err.message);
  }
}

const router = Router();

// 로그인/회원가입 무차별 대입 방지 — IP당 15분에 10회. 성공한 요청은 카운트에서 빼서
// 정상적으로 여러 번 로그인하는 사용자가 차단당하지 않게 함.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { error: "시도가 너무 많아. 15분 후 다시 시도해줘" },
});

export function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    nickname: user.nickname,
    username: user.username,
    realName: user.realName,
    birthDate: user.birthDate,
    phone: user.phone,
    role: user.role,
    emailVerified: user.emailVerified,
    kakaoLinked: !!user.kakaoId,
    googleLinked: !!user.googleId,
    // 카카오/구글로 막 가입한 계정은 아이디/실명/생년월일/휴대전화가 비어있어서, 프론트가 이걸 보고
    // "가입 완료" 온보딩 화면으로 보냄(POST /auth/complete-profile로 채워야 나머지 기능을 쓸 수 있음).
    profileComplete: !!(user.username && user.realName && user.birthDate && user.phone),
  };
}

// 이메일/아이디/휴대전화번호 중 하나라도 이미 쓰이고 있으면 뭐가 겹쳤는지 구체적으로 알려줌.
export async function findConflict({ email, username, phone }, excludeId) {
  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { username }, { phone }],
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
  });
  if (!existing) return null;
  if (existing.email === email) return "이미 가입된 이메일이야";
  if (existing.username === username) return "이미 사용 중인 아이디야";
  if (existing.phone === phone) return "이미 등록된 휴대전화번호야";
  return "이미 사용 중인 정보가 있어";
}

router.post("/signup", authLimiter, async (req, res, next) => {
  try {
    const { email, password, nickname, username, realName, birthDate, phone } = req.body;
    if (!email || !password || !nickname || !username || !realName || !birthDate || !phone) {
      return res.status(400).json({ error: "이메일, 닉네임, 아이디, 실명, 생년월일, 휴대전화번호, 비밀번호를 모두 입력해줘" });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: "비밀번호는 8자 이상이어야 해" });
    }
    const parsedBirthDate = new Date(birthDate);
    if (Number.isNaN(parsedBirthDate.getTime())) {
      return res.status(400).json({ error: "생년월일 형식이 올바르지 않아" });
    }

    const conflictMessage = await findConflict({ email, username, phone });
    if (conflictMessage) return res.status(409).json({ error: conflictMessage });

    const passwordHash = await bcrypt.hash(password, 10);
    const verificationFields = makeVerificationFields();
    const user = await prisma.user.create({
      data: { email, nickname, username, realName, birthDate: parsedBirthDate, phone, passwordHash, ...verificationFields },
    });
    await trySendVerificationEmail(user, verificationFields.emailVerificationToken);

    const token = signToken({ sub: user.id });
    res.cookie("token", token, authCookieOptions);
    res.status(201).json(publicUser(user));
  } catch (err) {
    next(err);
  }
});

// 이메일이 아니라 아이디(username)로 로그인함.
router.post("/login", authLimiter, async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await prisma.user.findUnique({ where: { username } });
    // passwordHash가 없는 계정은 소셜 로그인 전용으로 가입된 계정 — 일반 로그인 자체가 불가능함.
    if (!user || !user.passwordHash) return res.status(401).json({ error: "아이디 또는 비밀번호가 틀렸어" });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: "아이디 또는 비밀번호가 틀렸어" });

    const token = signToken({ sub: user.id });
    res.cookie("token", token, authCookieOptions);
    res.json(publicUser(user));
  } catch (err) {
    next(err);
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("token", authCookieOptions);
  res.status(204).end();
});

router.get("/me", requireAuth, (req, res) => {
  res.json(publicUser(req.user));
});

// 내 정보 수정. 아이디/생년월일은 신원 확인용 고정값으로 보고 여기선 안 바꿈 —
// 닉네임/이메일/실명/휴대전화번호만 수정 가능. 이메일을 바꾸면 재인증이 필요해서 emailVerified를
// 초기화하고 새 인증 메일을 보냄(안 그러면 바꾼 이메일이 "인증됨"으로 잘못 표시됨).
router.patch("/me", requireAuth, async (req, res, next) => {
  try {
    const { nickname, email, realName, phone } = req.body;
    if (!nickname || !email || !realName || !phone) {
      return res.status(400).json({ error: "닉네임, 이메일, 실명, 휴대전화번호를 모두 입력해줘" });
    }

    const conflictMessage = await findConflict({ email, username: req.user.username, phone }, req.user.id);
    if (conflictMessage) return res.status(409).json({ error: conflictMessage });

    const emailChanged = email !== req.user.email;
    const verificationFields = emailChanged
      ? { emailVerified: false, ...makeVerificationFields() }
      : {};

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { nickname, email, realName, phone, ...verificationFields },
    });
    if (emailChanged) await trySendVerificationEmail(updated, verificationFields.emailVerificationToken);
    res.json(publicUser(updated));
  } catch (err) {
    next(err);
  }
});

// 카카오/구글로 막 가입한 계정(username 등이 전부 비어있음)이 딱 한 번 거치는 온보딩.
// username은 이후로 불변 취급이라, 이미 채워진 계정이 다시 부르면 막음(그땐 PATCH /auth/me를 써야 함).
router.post("/complete-profile", requireAuth, async (req, res, next) => {
  try {
    if (req.user.username) return res.status(400).json({ error: "이미 가입이 완료된 계정이야" });

    const { username, realName, birthDate, phone, email } = req.body;
    const finalEmail = email || req.user.email;
    if (!username || !realName || !birthDate || !phone || !finalEmail) {
      return res.status(400).json({ error: "아이디, 실명, 생년월일, 휴대전화번호, 이메일을 모두 입력해줘" });
    }
    const parsedBirthDate = new Date(birthDate);
    if (Number.isNaN(parsedBirthDate.getTime())) {
      return res.status(400).json({ error: "생년월일 형식이 올바르지 않아" });
    }

    const conflictMessage = await findConflict({ email: finalEmail, username, phone }, req.user.id);
    if (conflictMessage) return res.status(409).json({ error: conflictMessage });

    const emailChanged = finalEmail !== req.user.email;
    const verificationFields = emailChanged ? { emailVerified: false, ...makeVerificationFields() } : {};

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { username, realName, birthDate: parsedBirthDate, phone, email: finalEmail, ...verificationFields },
    });
    if (emailChanged) await trySendVerificationEmail(updated, verificationFields.emailVerificationToken);
    res.json(publicUser(updated));
  } catch (err) {
    if (err.code === "P2002") return res.status(409).json({ error: "이미 사용 중인 정보가 있어" });
    next(err);
  }
});

router.post("/verify-email", async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: "인증 토큰이 없어" });

    const user = await prisma.user.findUnique({ where: { emailVerificationToken: token } });
    if (!user || !user.emailVerificationExpiresAt || user.emailVerificationExpiresAt < new Date()) {
      return res.status(400).json({ error: "인증 링크가 유효하지 않거나 만료됐어" });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, emailVerificationToken: null, emailVerificationExpiresAt: null },
    });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.post("/resend-verification", requireAuth, authLimiter, async (req, res, next) => {
  try {
    if (req.user.emailVerified) return res.status(400).json({ error: "이미 인증된 이메일이야" });

    const verificationFields = makeVerificationFields();
    const updated = await prisma.user.update({ where: { id: req.user.id }, data: verificationFields });
    await trySendVerificationEmail(updated, verificationFields.emailVerificationToken);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
