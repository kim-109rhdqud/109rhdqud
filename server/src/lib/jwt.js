import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
const isProd = process.env.NODE_ENV === "production";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET이 설정 안 됐어. server/.env.example 참고해서 server/.env 만들 것.");
}

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

// 프론트/백엔드가 서로 다른 도메인에 배포되므로(docs/BACKEND.md 참고),
// 로컬(http)에서는 lax, 배포(https, 교차 도메인)에서는 none+secure가 필요함.
export const authCookieOptions = {
  httpOnly: true,
  sameSite: isProd ? "none" : "lax",
  secure: isProd,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7일
};
