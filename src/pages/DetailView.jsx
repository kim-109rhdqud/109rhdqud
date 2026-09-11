import { Heart, Play, User } from "lucide-react";
import { CategoryTag } from "../components/CategoryTag";
import { MemeCard } from "../components/MemeCard";
import { MetricBar } from "../components/MetricBar";
import { Sparkline } from "../components/Sparkline";
import { SectionHeading } from "../components/SectionHeading";
import { VerificationBadge, VerificationSection } from "../components/VerificationBadge";
import { CATEGORIES, memeById } from "../data/memes";

export function DetailView({ id, setView, user, scraps, toggleScrap }) {
  const meme = memeById(id);
  if (!meme) return <div className="max-w-3xl mx-auto px-5 py-20 text-center text-gray-500">밈을 찾을 수 없어.</div>;

  const isScrapped = scraps.includes(meme.id);
  const related = meme.relatedMemeIds.map(memeById).filter(Boolean);
  const relatedGrouped = CATEGORIES.map((cat) => ({
    cat,
    items: related.filter((m) => m.categories.includes(cat)),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      <div className="flex flex-wrap items-center gap-1 mb-3">
        {meme.categories.map((c) => (
          <CategoryTag key={c}>{c}</CategoryTag>
        ))}
        <VerificationBadge verification={meme.verification} />
      </div>
      <div className="flex items-start justify-between gap-4 mb-2">
        <h1 className="font-serif-kr text-3xl md:text-4xl">{meme.name}</h1>
        <button
          onClick={() => (user ? toggleScrap(meme.id) : setView({ name: "auth" }))}
          className={`shrink-0 flex items-center gap-1.5 text-sm border px-3 py-1.5 ${
            isScrapped ? "border-black bg-black text-white" : "border-gray-300 text-gray-600 hover:border-black"
          }`}
        >
          <Heart size={14} fill={isScrapped ? "white" : "none"} /> {isScrapped ? "스크랩됨" : "스크랩"}
        </button>
      </div>
      <p className="text-gray-600 mb-8">{meme.oneLiner}</p>

      {/* 핵심 정보 */}
      <div className="grid sm:grid-cols-3 gap-px bg-gray-200 border border-gray-200 mb-12 text-sm">
        {[
          ["무엇인지", meme.oneLineSummary],
          ["유행 시기", meme.period],
          ["주요 플랫폼", meme.platforms.join(", ")],
          ["현재 화제성", `${meme.popularity.buzz} / 100`],
          ["카테고리", meme.categories.join(", ")],
          ["관련 키워드", meme.keywords.join(", ")],
        ].map(([label, value]) => (
          <div key={label} className="bg-white p-4">
            <div className="text-xs text-gray-400 mb-1">{label}</div>
            <div className="text-black">{value}</div>
          </div>
        ))}
      </div>

      {/* 설명 */}
      <div className="space-y-4 mb-12">
        {[
          ["이게 뭐야?", meme.whatIsIt],
          ["왜 유행했어?", meme.whyPopular],
          ["어떻게 사용하는 거야?", meme.howToUse],
        ].map(([title, text]) => (
          <div key={title} className="border border-gray-200 p-5">
            <h3 className="font-serif-kr text-base mb-2">{title}</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{text}</p>
          </div>
        ))}
        <div className="border border-black p-5">
          <h3 className="font-serif-kr text-base mb-2">한 줄 요약</h3>
          <p className="text-sm text-black">{meme.oneLineSummary}</p>
        </div>
      </div>

      {/* 에디터 인증 */}
      <VerificationSection verification={meme.verification} />

      {/* 유래와 확산 과정 */}
      <section className="mb-12">
        <SectionHeading title="유래와 확산 과정" mock />
        <div className="relative pl-6 border-l border-gray-300 space-y-6">
          {meme.timeline.map((t, i) => (
            <div key={i} className="relative">
              <span className="absolute -left-[27px] top-1 w-2.5 h-2.5 bg-black rounded-full" />
              <div className="text-xs text-gray-500 mb-0.5">{t.date}</div>
              <div className="text-sm text-black">{t.text}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 관련 영상 */}
      <section className="mb-12">
        <SectionHeading title="관련 영상" mock />
        {meme.relatedVideos.length === 0 ? (
          <p className="text-sm text-gray-400">등록된 관련 영상이 아직 없어.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {meme.relatedVideos.map((v, i) => (
              <div key={i} className="border border-gray-200">
                <div className="aspect-video bg-gray-100 flex items-center justify-center text-gray-300">
                  <Play size={28} />
                </div>
                <div className="p-3">
                  <div className="text-sm text-black">{v.title}</div>
                  <div className="text-xs text-gray-500 mt-1">{v.channel}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 관련 밈 (카테고리별로 관련 밈 / 관련 유행어 / 관련 상품 / 관련 챌린지 등으로 구분) */}
      <section className="mb-12">
        <h2 className="font-serif-kr text-xl mb-5">관련 밈</h2>
        {relatedGrouped.length === 0 ? (
          <p className="text-sm text-gray-400">관련 항목이 아직 등록되지 않았어.</p>
        ) : (
          <div className="space-y-6">
            {relatedGrouped.map((g) => (
              <div key={g.cat}>
                <h3 className="text-sm text-gray-500 mb-3">관련 {g.cat}</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {g.items.map((m) => (
                    <MemeCard key={m.id} meme={m} onOpen={(mid) => setView({ name: "detail", id: mid })} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 관련 인물 */}
      <section className="mb-12">
        <SectionHeading title="관련 인물" mock />
        {meme.relatedPeople.length === 0 ? (
          <p className="text-sm text-gray-400">확인된 관련 인물 정보가 아직 없어.</p>
        ) : (
          <div className="space-y-3">
            {meme.relatedPeople.map((p, i) => (
              <div key={i} className="flex gap-3 border border-gray-200 p-4">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                  <User size={18} />
                </div>
                <div>
                  <div className="text-black text-sm">{p.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{p.reason}</div>
                  <div className="text-xs text-gray-400 mt-1">출처: {p.content} · 미확인 정보 포함 가능 (Mock Data)</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 유행 지표 */}
      <section>
        <SectionHeading title="유행 지표" mock />
        <div className="space-y-4 max-w-md mb-6">
          <MetricBar label="화제성" value={meme.popularity.buzz} />
          <MetricBar label="검색량" value={meme.popularity.search} />
          <MetricBar label="사용 빈도" value={meme.popularity.usage} />
        </div>
        <div className="max-w-md">
          <Sparkline label="최근 관심도 추이" values={meme.popularity.trend} />
        </div>
      </section>
    </div>
  );
}
