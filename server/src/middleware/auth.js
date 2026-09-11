import { verifyToken } from "../lib/jwt.js";
import { prisma } from "../lib/prisma.js";

// 쿠키의 JWT를 검증하고 req.user에 실제 유저 레코드를 채워넣음.
export async function requireAuth(req, res, next) {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ error: "로그인이 필요해" });

  try {
    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) return res.status(401).json({ error: "존재하지 않는 사용자야" });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: "세션이 만료됐거나 유효하지 않아" });
  }
}

// requireAuth 다음에 붙여서 쓰는 role 체크. requireAuth 없이 단독으로 쓰면 항상 403.
export function requireEditor(req, res, next) {
  if (!req.user || !["editor", "admin"].includes(req.user.role)) {
    return res.status(403).json({ error: "에디터 권한이 필요해" });
  }
  next();
}
