import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireEditor } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

// 제보 등록 — 이름/카테고리/한줄설명/출처 링크만 최소로 받아서 payload에 담음.
router.post("/", async (req, res, next) => {
  try {
    const { name, category, oneLiner, sourceUrl } = req.body;
    if (!name || !category || !oneLiner || !sourceUrl) {
      return res.status(400).json({ error: "밈 이름, 카테고리, 한줄설명, 출처 링크를 모두 입력해줘" });
    }
    const submission = await prisma.submission.create({
      data: { submittedById: req.user.id, payload: { name, category, oneLiner, sourceUrl } },
    });
    res.status(201).json(submission);
  } catch (err) {
    next(err);
  }
});

// 전체 큐(에디터 전용, 제보자 닉네임 포함) — "내 제보"와 별개 엔드포인트로 분리해둠.
// 같이 쓰면 에디터/관리자 계정이 "내 제보 목록"을 열었을 때 남의 제보까지 자기 것처럼 보이는 문제가 있었음.
router.get("/", requireEditor, async (req, res, next) => {
  try {
    const all = await prisma.submission.findMany({
      include: { submittedBy: { select: { nickname: true, username: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(all);
  } catch (err) {
    next(err);
  }
});

// 내 제보만 — 역할 상관없이 항상 호출한 사람 것만 반환.
router.get("/mine", async (req, res, next) => {
  try {
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
