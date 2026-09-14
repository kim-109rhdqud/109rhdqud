import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { signToken, verifyToken, authCookieOptions } from "../lib/jwt.js";
import { makeVerificationFields, trySendVerificationEmail } from "./auth.js";

const router = Router();

const SERVER_ORIGIN = process.env.SERVER_ORIGIN || "http://localhost:4000";
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

const KAKAO_REST_API_KEY = process.env.KAKAO_REST_API_KEY;
const KAKAO_CLIENT_SECRET = process.env.KAKAO_CLIENT_SECRET; // 선택
const KAKAO_REDIRECT_URI = `${SERVER_ORIGIN}/auth/kakao/callback`;

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = `${SERVER_ORIGIN}/auth/google/callback`;

// 쿠키에 유효한 세션이 있으면 그 유저를 반환, 없으면(비로그인/만료) null.
// requireAuth 미들웨어와 달리 401을 던지지 않음 — 여기선 "로그인 안 된 상태"도 정상 분기라서.
async function currentUserFromCookie(req) {
  const token = req.cookies?.token;
  if (!token) return null;
  try {
    const payload = verifyToken(token);
    return await prisma.user.findUnique({ where: { id: payload.sub } });
  } catch {
    return null;
  }
}

function logUserIn(res, user) {
  const token = signToken({ sub: user.id });
  res.cookie("token", token, authCookieOptions);
}

// 소셜 로그인 콜백 공통 처리.
// 이미 로그인된 상태(쿠키 있음) → "연동" 모드: 지금 로그인된 계정에 provider id를 붙임.
// 비로그인 상태 → 그 provider id로 이미 연동된 계정이 있으면 로그인, 없으면 "바로 가입" —
// 새 계정을 만들고 로그인시킨 다음 온보딩(/complete-profile)으로 보냄. 정식 회원가입 폼이 받는
// 아이디/실명/생년월일/휴대전화는 소셜 프로필에 없는 정보라 가입 직후에 별도로 채워야 함
// (2026-09-14: 애초엔 "연동해둔 계정 있을 때만 로그인" 방식이었는데, 소셜로 바로 가입도 되게
// 해달라는 요청으로 바뀜 — 신원 확인용 필드는 온보딩으로 옮기는 절충안으로 처리).
async function finishOAuth(req, res, { field, providerUserId, providerNickname, providerEmail, emailTakenError }) {
  const sessionUser = await currentUserFromCookie(req);

  if (sessionUser) {
    try {
      await prisma.user.update({ where: { id: sessionUser.id }, data: { [field]: providerUserId } });
      return res.redirect(`${CLIENT_ORIGIN}/edit-profile?linked=${field}`);
    } catch (err) {
      if (err.code === "P2002") {
        return res.redirect(`${CLIENT_ORIGIN}/edit-profile?linkError=1`);
      }
      throw err;
    }
  }

  const existing = await prisma.user.findUnique({ where: { [field]: providerUserId } });
  if (existing) {
    logUserIn(res, existing);
    return res.redirect(CLIENT_ORIGIN);
  }

  // 구글은 이메일을 주는데, 그 이메일로 이미(다른 방식으로) 가입된 계정이 있으면 새로 만들지 않고
  // 안내함 — 같은 사람이 계정 두 개로 쪼개지는 걸 막고, 대신 일반 로그인 후 연동하라고 유도.
  if (providerEmail) {
    const emailOwner = await prisma.user.findUnique({ where: { email: providerEmail } });
    if (emailOwner) return res.redirect(`${CLIENT_ORIGIN}/login?error=${emailTakenError}`);
  }

  try {
    // 구글은 이메일을 주자마자 있으니(카카오는 없음), 일반 가입과 마찬가지로 바로 인증 메일을 보냄.
    const verificationFields = providerEmail ? makeVerificationFields() : {};
    const created = await prisma.user.create({
      data: { nickname: providerNickname, email: providerEmail ?? null, [field]: providerUserId, ...verificationFields },
    });
    if (providerEmail) await trySendVerificationEmail(created, verificationFields.emailVerificationToken);
    logUserIn(res, created);
    return res.redirect(`${CLIENT_ORIGIN}/complete-profile`);
  } catch (err) {
    if (err.code === "P2002") return res.redirect(`${CLIENT_ORIGIN}/login?error=${emailTakenError}`);
    throw err;
  }
}

router.get("/kakao", (req, res) => {
  if (!KAKAO_REST_API_KEY) return res.redirect(`${CLIENT_ORIGIN}/login?error=kakao_unconfigured`);
  const params = new URLSearchParams({
    client_id: KAKAO_REST_API_KEY,
    redirect_uri: KAKAO_REDIRECT_URI,
    response_type: "code",
  });
  res.redirect(`https://kauth.kakao.com/oauth/authorize?${params}`);
});

router.get("/kakao/callback", async (req, res, next) => {
  try {
    const { code } = req.query;
    if (!code) return res.redirect(`${CLIENT_ORIGIN}/login?error=kakao_failed`);

    const tokenRes = await fetch("https://kauth.kakao.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: KAKAO_REST_API_KEY,
        redirect_uri: KAKAO_REDIRECT_URI,
        code,
        ...(KAKAO_CLIENT_SECRET ? { client_secret: KAKAO_CLIENT_SECRET } : {}),
      }),
    });
    const tokenBody = await tokenRes.json();
    if (!tokenRes.ok) throw new Error(`카카오 토큰 발급 실패: ${JSON.stringify(tokenBody)}`);

    const profileRes = await fetch("https://kapi.kakao.com/v2/user/me", {
      headers: { Authorization: `Bearer ${tokenBody.access_token}` },
    });
    const profile = await profileRes.json();
    if (!profileRes.ok) throw new Error(`카카오 프로필 조회 실패: ${JSON.stringify(profile)}`);

    // account_email 동의를 신청하지 않아서(비즈니스 인증 필요) 카카오는 이메일이 안 옴 — 이후
    // 온보딩(/complete-profile)에서 이메일을 직접 입력받음.
    await finishOAuth(req, res, {
      field: "kakaoId",
      providerUserId: String(profile.id),
      providerNickname: profile.kakao_account?.profile?.nickname || profile.properties?.nickname || "카카오유저",
      providerEmail: null,
      emailTakenError: "kakao_email_taken",
    });
  } catch (err) {
    next(err);
  }
});

router.get("/google", (req, res) => {
  if (!GOOGLE_CLIENT_ID) return res.redirect(`${CLIENT_ORIGIN}/login?error=google_unconfigured`);
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: "code",
    scope: "openid email profile",
  });
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
});

router.get("/google/callback", async (req, res, next) => {
  try {
    const { code } = req.query;
    if (!code) return res.redirect(`${CLIENT_ORIGIN}/login?error=google_failed`);

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_REDIRECT_URI,
        code,
      }),
    });
    const tokenBody = await tokenRes.json();
    if (!tokenRes.ok) throw new Error(`구글 토큰 발급 실패: ${JSON.stringify(tokenBody)}`);

    const profileRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokenBody.access_token}` },
    });
    const profile = await profileRes.json();
    if (!profileRes.ok) throw new Error(`구글 프로필 조회 실패: ${JSON.stringify(profile)}`);

    await finishOAuth(req, res, {
      field: "googleId",
      providerUserId: profile.sub,
      providerNickname: profile.name || "구글유저",
      providerEmail: profile.email || null,
      emailTakenError: "google_email_taken",
    });
  } catch (err) {
    next(err);
  }
});

export default router;
