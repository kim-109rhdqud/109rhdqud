import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { signToken, authCookieOptions } from "../lib/jwt.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

function publicUser(user) {
  return { id: user.id, email: user.email, nickname: user.nickname, role: user.role };
}

router.post("/signup", async (req, res, next) => {
  try {
    const { email, password, nickname } = req.body;
    if (!email || !password || !nickname) {
      return res.status(400).json({ error: "닉네임, 이메일, 비밀번호를 모두 입력해줘" });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: "비밀번호는 8자 이상이어야 해" });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: "이미 가입된 이메일이야" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { email, nickname, passwordHash } });

    const token = signToken({ sub: user.id });
    res.cookie("token", token, authCookieOptions);
    res.status(201).json(publicUser(user));
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "이메일 또는 비밀번호가 틀렸어" });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: "이메일 또는 비밀번호가 틀렸어" });

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

export default router;
