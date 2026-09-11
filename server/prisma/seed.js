// 기존 src/data/memes.js의 Mock 데이터를 DB로 옮기는 1회성 시드 스크립트.
// 실행: node prisma/seed.js (npm run으로 감싸지 말 것 — CLAUDE.md의 cmd.exe 이슈 참고)
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { MEMES } from "../../src/data/memes.js";

const prisma = new PrismaClient();

async function main() {
  for (const m of MEMES) {
    const ranks = Object.entries(m.rank).map(([period, r]) => ({
      period,
      rank: r.r,
      change: r.ch ?? null,
      isNew: !!r.isNew,
    }));

    const verificationData = m.verification?.verified
      ? {
          verified: true,
          sources: m.verification.sources,
          copyrightHolder: m.verification.copyrightHolder ?? null,
          reviewedBy: m.verification.reviewedBy,
          reviewedAt: new Date(m.verification.reviewedAt),
          changeLog: m.verification.changeLog,
        }
      : { verified: false, sources: [], changeLog: [] };

    await prisma.meme.upsert({
      where: { id: m.id },
      update: {},
      create: {
        id: m.id,
        name: m.name,
        categories: m.categories,
        oneLiner: m.oneLiner,
        whatIsIt: m.whatIsIt,
        whyPopular: m.whyPopular,
        howToUse: m.howToUse,
        oneLineSummary: m.oneLineSummary,
        platforms: m.platforms,
        period: m.period,
        keywords: m.keywords,
        registeredAt: new Date(m.registeredAt),
        buzz: m.popularity.buzz,
        search: m.popularity.search,
        usage: m.popularity.usage,
        trend: m.popularity.trend,
        timeline: m.timeline,
        relatedVideos: m.relatedVideos,
        relatedPeople: m.relatedPeople,
        relatedMemeIds: m.relatedMemeIds,
        ranks: { create: ranks },
        verification: { create: verificationData },
      },
    });
  }
  console.log(`${MEMES.length}개 밈 시드 완료`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
