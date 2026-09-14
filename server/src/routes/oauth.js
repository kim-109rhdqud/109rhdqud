import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { signToken, verifyToken, authCookieOptions } from "../lib/jwt.js";

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

// 소셜 로그인 콜백 공통 처리.
// 이미 로그인된 상태(쿠키 있음) → "연동" 모드: 지금 로그인된 계정에 provider id를 붙임.
// 비로그인 상태 → "소셜 로그인" 모드: 그 provider id로 이미 연동된 계정이 있을 때만 로그인시키고,
// 없으면 새 계정을 만들지 않고 에러로 리다이렉트함 — 회원가입(실명/생년월일/휴대전화 수집)을
// 소셜 로그인으로 우회할 수 없게 하려는 의도적인 설계.
async function finishOAuth(req, res, { field, providerUserId, notLinkedError }) {
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

  const user = await prisma.user.findUnique({ where: { [field]: providerUserId } });
  if (!user) {
    return res.redirect(`${CLIENT_ORIGIN}/login?error=${notLinkedError}`);
  }
  const token = signToken({ sub: user.id });
  res.cookie("token", token, authCookieOptions);
  res.redirect(CLIENT_ORIGIN);
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

    await finishOAuth(req, res, { field: "kakaoId", providerUserId: String(profile.id), notLinkedError: "kakao_not_linked" });
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

    await finishOAuth(req, res, { field: "googleId", providerUserId: profile.sub, notLinkedError: "google_not_linked" });
  } catch (err) {
    next(err);
  }
});

export default router;
