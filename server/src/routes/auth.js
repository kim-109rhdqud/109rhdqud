import { Router } from "express";
import bcrypt from "bcryptjs";
import rateLimit from "express-rate-limit";
import { prisma } from "../lib/prisma.js";
import { signToken, authCookieOptions } from "../lib/jwt.js";
import { requireAuth } from "../middleware/auth.js";

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
  };
}

// 이메일/아이디/휴대전화번호 중 하나라도 이미 쓰이고 있으면 뭐가 겹쳤는지 구체적으로 알려줌.
async function findConflict({ email, username, phone }, excludeId) {
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
    const user = await prisma.user.create({
      data: { email, nickname, username, realName, birthDate: parsedBirthDate, phone, passwordHash },
    });

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
    if (!user) return res.status(401).json({ error: "아이디 또는 비밀번호가 틀렸어" });

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
// 닉네임/이메일/실명/휴대전화번호만 수정 가능.
router.patch("/me", requireAuth, async (req, res, next) => {
  try {
    const { nickname, email, realName, phone } = req.body;
    if (!nickname || !email || !realName || !phone) {
      return res.status(400).json({ error: "닉네임, 이메일, 실명, 휴대전화번호를 모두 입력해줘" });
    }

    const conflictMessage = await findConflict({ email, username: req.user.username, phone }, req.user.id);
    if (conflictMessage) return res.status(409).json({ error: conflictMessage });

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { nickname, email, realName, phone },
    });
    res.json(publicUser(updated));
  } catch (err) {
    next(err);
  }
});

export default router;
