import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { publicUser } from "./auth.js";

const router = Router();
router.use(requireAuth, requireAdmin);

// 실명/생년월일/휴대전화번호까지 대량으로 내려줄 필요는 없음 — 관리 화면에서 쓰는 필드만.
router.get("/", async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, username: true, nickname: true, email: true, role: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(users);
  } catch (err) {
    next(err);
  }
});

router.patch("/:id/role", async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!["user", "editor", "admin"].includes(role)) {
      return res.status(400).json({ error: "role은 user/editor/admin 중 하나여야 해" });
    }
    const user = await prisma.user.update({ where: { id: req.params.id }, data: { role } });
    res.json(publicUser(user));
  } catch (err) {
    next(err);
  }
});

export default router;
