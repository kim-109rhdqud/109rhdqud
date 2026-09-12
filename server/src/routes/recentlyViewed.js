import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (req, res, next) => {
  try {
    const rows = await prisma.recentlyViewed.findMany({
      where: { userId: req.user.id },
      include: { meme: { include: { verification: true, ranks: true } } },
      orderBy: { viewedAt: "desc" },
      take: 5,
    });
    res.json(rows.map((r) => r.meme));
  } catch (err) {
    next(err);
  }
});

router.post("/:memeId", async (req, res, next) => {
  try {
    await prisma.recentlyViewed.upsert({
      where: { userId_memeId: { userId: req.user.id, memeId: req.params.memeId } },
      update: { viewedAt: new Date() },
      create: { userId: req.user.id, memeId: req.params.memeId },
    });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
