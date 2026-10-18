import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAdmin, requireAuth, requireEditor } from "../middleware/auth.js";

const router = Router();

const ID_PATTERN = /^[a-z0-9-]+$/;

// 등록(POST)과 수정(PATCH)이 같은 필드·검증 규칙을 쓰므로 한 군데서 처리.
// 실패하면 { error }, 성공하면 DB에 그대로 넣을 { data }를 돌려줌. id는 여기서 안 다룸(수정 불가).
function memeDataFromBody(body) {
  const {
    name,
    categories,
    oneLiner,
    oneLineSummary,
    whatIsIt,
    whyPopular,
    howToUse,
    platforms,
    period,
    keywords,
    registeredAt,
    buzz,
    search,
    usage,
    trend,
    timeline,
    relatedVideos,
    relatedPeople,
    relatedMemeIds,
  } = body;

  if (
    !name ||
    !oneLiner ||
    !oneLineSummary ||
    !whatIsIt ||
    !whyPopular ||
    !howToUse ||
    !period ||
    !Array.isArray(categories) ||
    categories.length === 0 ||
    !Array.isArray(platforms) ||
    platforms.length === 0 ||
    !Array.isArray(keywords) ||
    keywords.length === 0 ||
    !Array.isArray(trend) ||
    trend.length < 2
  ) {
    return { error: "필수 항목이 비어 있어(카테고리/플랫폼/키워드는 1개 이상, 유행 추이는 2개 이상 필요)" };
  }

  return {
    data: {
      name,
      categories,
      oneLiner,
      oneLineSummary,
      whatIsIt,
      whyPopular,
      howToUse,
      platforms,
      period,
      keywords,
      registeredAt: new Date(registeredAt || Date.now()),
      buzz: Number(buzz) || 0,
      search: Number(search) || 0,
      usage: Number(usage) || 0,
      trend: trend.map(Number),
      timeline: timeline ?? [],
      relatedVideos: relatedVideos ?? [],
      relatedPeople: relatedPeople ?? [],
      relatedMemeIds: relatedMemeIds ?? [],
    },
  };
}

// 밈 등록 (에디터 전용). 제보 승인 자체는 자동 등록이 아니라서(STRATEGY.md 2-6),
// 승인된 제보를 검수해 실제 콘텐츠로 채운 뒤 이 API로 별도 등록함.
router.post("/", requireAuth, requireEditor, async (req, res, next) => {
  try {
    const { id, submissionId } = req.body;
    if (!id) return res.status(400).json({ error: "고유 ID가 비어 있어" });
    const { error, data } = memeDataFromBody(req.body);
    if (error) return res.status(400).json({ error });
    if (!ID_PATTERN.test(id)) {
      return res.status(400).json({ error: "고유 ID는 영문 소문자/숫자/하이픈만 쓸 수 있어" });
    }

    // 빠른 실패용 사전 체크(친절한 메시지) — 그래도 동시에 같은 id로 두 요청이 들어오면
    // 이 체크를 둘 다 통과할 수 있어서, 진짜 보장은 아래 catch의 P2002(고유 제약 위반) 처리가 함.
    const existing = await prisma.meme.findUnique({ where: { id } });
    if (existing) return res.status(409).json({ error: "이미 사용 중인 ID야" });

    // 제보에서 등록하는 경우, 친절한 사전 체크(있는지/이미 등록됐는지) 먼저 —
    // 진짜 중복 방지 보장은 아래 트랜잭션의 updateMany 조건절(registeredMemeId: null)이 함.
    // findUnique로 먼저 보고 나중에 update하는 방식은 READ COMMITTED에서 잠금이 없어서
    // 두 요청이 동시에 들어오면 둘 다 통과할 수 있음 — 그래서 조건부 updateMany로 원자적으로 처리함.
    if (submissionId) {
      const submission = await prisma.submission.findUnique({ where: { id: submissionId } });
      if (!submission) return res.status(404).json({ error: "연결하려는 제보를 찾을 수 없어" });
      if (submission.registeredMemeId) {
        return res.status(409).json({ error: "이 제보는 이미 다른 밈으로 등록됐어" });
      }
    }

    const meme = await prisma.$transaction(async (tx) => {
      const created = await tx.meme.create({ data: { id, ...data } });

      if (submissionId) {
        // 조건부 UPDATE 자체가 원자적 연산이라, registeredMemeId가 여전히 null인 행만 실제로 바뀜.
        // 그 사이 다른 요청이 먼저 채워놨으면 count가 0이 되고, 이 경우 예외를 던져서 방금 만든
        // meme 생성까지 트랜잭션째로 롤백시킴(고아 레코드가 안 남게).
        const { count } = await tx.submission.updateMany({
          where: { id: submissionId, registeredMemeId: null },
          data: { registeredMemeId: created.id },
        });
        if (count === 0) {
          throw Object.assign(new Error("이 제보는 이미 다른 밈으로 등록됐어"), { status: 409 });
        }
      }
      return created;
    });

    res.status(201).json(meme);
  } catch (err) {
    if (err.code === "P2002") return res.status(409).json({ error: "이미 사용 중인 ID야" });
    next(err);
  }
});

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

// 밈 내용 수정 (에디터 전용). id는 URL(/meme/:id)에 쓰여서 바꾸면 공유된 링크가 깨지므로 수정 불가.
// 필드를 통째로 교체함(부분 병합 아님) — 프론트 수정 폼이 기존 값을 전부 채워서 보냄.
router.patch("/:id", requireAuth, requireEditor, async (req, res, next) => {
  try {
    const { error, data } = memeDataFromBody(req.body);
    if (error) return res.status(400).json({ error });
    // 자기 자신을 관련 밈으로 거는 건 의미가 없어서 걸러냄.
    data.relatedMemeIds = data.relatedMemeIds.filter((rid) => rid !== req.params.id);

    const meme = await prisma.meme.update({
      where: { id: req.params.id },
      data,
      include: { verification: true, ranks: true },
    });
    res.json(meme);
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ error: "밈을 찾을 수 없어" });
    next(err);
  }
});

// 밈 삭제 (관리자 전용 — 되돌릴 수 없어서 에디터보다 한 단계 높게 둠).
// 랭킹/인증마크/스크랩/최근 본 기록은 FK onDelete: Cascade라 같이 지워짐. FK가 아닌 느슨한 참조 두 가지는
// 여기서 직접 정리함: 다른 밈의 relatedMemeIds에서 빼고, 이 밈으로 등록됐던 제보는 registeredMemeId를
// 비워서 제보 큐에서 다시 "밈으로 등록"할 수 있게 함.
router.delete("/:id", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.$transaction(async (tx) => {
      await tx.meme.delete({ where: { id } });

      const referencing = await tx.meme.findMany({
        where: { relatedMemeIds: { has: id } },
        select: { id: true, relatedMemeIds: true },
      });
      for (const m of referencing) {
        await tx.meme.update({
          where: { id: m.id },
          data: { relatedMemeIds: m.relatedMemeIds.filter((rid) => rid !== id) },
        });
      }

      await tx.submission.updateMany({ where: { registeredMemeId: id }, data: { registeredMemeId: null } });
    });
    res.status(204).end();
  } catch (err) {
    if (err.code === "P2025") return res.status(404).json({ error: "밈을 찾을 수 없어" });
    next(err);
  }
});

// 인증마크 갱신 (에디터 전용). 호출할 때마다 changeLog에 이력을 쌓음.
router.patch("/:id/verification", requireAuth, requireEditor, async (req, res, next) => {
  try {
    const { verified, sources, copyrightHolder, note } = req.body;
    // STRATEGY.md 2-3 체크리스트: 인증마크는 "독립 출처 2개 이상"이 근거일 때만 붙일 수 있음.
    if (verified && (!Array.isArray(sources) || sources.length < 2)) {
      return res.status(400).json({ error: "인증하려면 독립 출처가 2개 이상 필요해" });
    }
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
