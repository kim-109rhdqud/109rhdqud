import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireEditor } from "../middleware/auth.js";

const router = Router();

// GET /memes?category=유행어&q=쫀득
router.get("/", async (req, res, next) => {
  try {
    const { category, q } = req.query;
    const memes = await prisma.meme.findMany({
      where: {
        ...(category ? { categories: { has: category } } : {}),
        ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
      },
      include: { verification: true, ranks: true },
      orderBy: { registeredAt: "desc" },
    });
    res.json(memes);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const meme = await prisma.meme.findUnique({
      where: { id: req.params.id },
      include: { verification: true, ranks: true },
    });
    if (!meme) return res.status(404).json({ error: "밈을 찾을 수 없어" });
    res.json(meme);
  } catch (err) {
    next(err);
  }
});

// 인증마크 갱신 (에디터 전용). 호출할 때마다 changeLog에 이력을 쌓음.
router.patch("/:id/verification", requireAuth, requireEditor, async (req, res, next) => {
  try {
    const { verified, sources, copyrightHolder, note } = req.body;
    const meme = await prisma.meme.findUnique({
      where: { id: req.params.id },
      include: { verification: true },
    });
    if (!meme) return res.status(404).json({ error: "밈을 찾을 수 없어" });

    const prevLog = meme.verification?.changeLog ?? [];
    const changeLog = [
      ...prevLog,
      {
        date: new Date().toISOString().slice(0, 10),
        editor: req.user.email,
        note: note || "검수 갱신",
      },
    ];

    const verification = await prisma.verification.upsert({
      where: { memeId: meme.id },
      update: {
        verified: !!verified,
        sources: sources ?? [],
        copyrightHolder: copyrightHolder ?? null,
        reviewedBy: req.user.email,
        reviewedAt: new Date(),
        changeLog,
      },
      create: {
        memeId: meme.id,
        verified: !!verified,
        sources: sources ?? [],
        copyrightHolder: copyrightHolder ?? null,
        reviewedBy: req.user.email,
        reviewedAt: new Date(),
        changeLog,
      },
    });
    res.json(verification);
  } catch (err) {
    next(err);
  }
});

export default router;
