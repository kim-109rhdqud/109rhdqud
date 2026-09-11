import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth); // 스크랩은 전부 로그인 필요

router.get("/", async (req, res, next) => {
  try {
    const scraps = await prisma.scrap.findMany({
      where: { userId: req.user.id },
      include: { meme: { include: { verification: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(scraps.map((s) => s.meme));
  } catch (err) {
    next(err);
  }
});

router.post("/:memeId", async (req, res, next) => {
  try {
    const scrap = await prisma.scrap.upsert({
      where: { userId_memeId: { userId: req.user.id, memeId: req.params.memeId } },
      update: {},
      create: { userId: req.user.id, memeId: req.params.memeId },
    });
    res.status(201).json(scrap);
  } catch (err) {
    next(err);
  }
});

router.delete("/:memeId", async (req, res, next) => {
  try {
    await prisma.scrap.deleteMany({ where: { userId: req.user.id, memeId: req.params.memeId } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
