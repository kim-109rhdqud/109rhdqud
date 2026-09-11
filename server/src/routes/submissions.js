import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireEditor } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

// 제보 등록 — payload에는 제보자가 작성한 밈 초안(이름/설명 등)이 그대로 들어감.
router.post("/", async (req, res, next) => {
  try {
    const submission = await prisma.submission.create({
      data: { submittedById: req.user.id, payload: req.body },
    });
    res.status(201).json(submission);
  } catch (err) {
    next(err);
  }
});

// 에디터는 전체 큐, 일반 유저는 자기 제보만 조회
router.get("/", async (req, res, next) => {
  try {
    if (["editor", "admin"].includes(req.user.role)) {
      const all = await prisma.submission.findMany({ orderBy: { createdAt: "desc" } });
      return res.json(all);
    }
    const mine = await prisma.submission.findMany({
      where: { submittedById: req.user.id },
      orderBy: { createdAt: "desc" },
    });
    res.json(mine);
  } catch (err) {
    next(err);
  }
});

// 승인/반려 (에디터 전용). 승인해도 Meme 레코드가 자동 생성되진 않음 —
// 에디터가 내용을 검수해서 별도로 등록하라는 취지 (STRATEGY.md 2-6 참고).
router.patch("/:id", requireEditor, async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "status는 approved 또는 rejected여야 해" });
    }
    const submission = await prisma.submission.update({
      where: { id: req.params.id },
      data: { status, reviewedById: req.user.id, reviewedAt: new Date() },
    });
    res.json(submission);
  } catch (err) {
    next(err);
  }
});

export default router;
