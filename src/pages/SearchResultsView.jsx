import { ChevronRight } from "lucide-react";
import { CategoryTag } from "../components/CategoryTag";
import { MemeCard } from "../components/MemeCard";
import { CATEGORIES, MEMES } from "../data/memes";

/* 두 문자열이 얼마나 겹치는 글자를 공유하는지로 대략적인 유사도를 매긴다 (Mock 추천용, 형태소 분석 아님). */
function similarity(a, b) {
  const setA = new Set(a);
  let shared = 0;
  for (const ch of b) if (setA.has(ch)) shared++;
  return shared / Math.max(a.length, b.length, 1);
}

function suggestSimilar(query, count = 4) {
  return [...MEMES]
    .map((m) => ({ meme: m, score: similarity(query, m.name) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map((s) => s.meme);
}

export function SearchResultsView({ query, setView }) {
  const q = query.trim();
  const results = MEMES.filter(
    (m) => m.name.includes(q) || m.keywords.some((k) => k.includes(q)) || m.oneLiner.includes(q)
  );
  const exact = MEMES.find((m) => m.name === q);
  const grouped = CATEGORIES.map((cat) => ({
    cat,
    items: results.filter((m) => m.categories.includes(cat) && m.id !== exact?.id),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      <p className="text-sm text-neutral-400 mb-1">검색 결과</p>
      <h1 className="font-serif-kr text-2xl mb-8">'{q}'</h1>

      {results.length === 0 ? (
        <div className="surface-card p-10 text-center">
          <p className="text-neutral-600 mb-4">아직 밈 사전에 등록되지 않은 것 같아.</p>
          <p className="text-sm text-neutral-400 mb-3">이런 항목은 어때?</p>
          <div className="flex justify-center gap-2 flex-wrap">
            {suggestSimilar(q).map((m) => (
              <button
                key={m.id}
                onClick={() => setView({ name: "search", query: m.name })}
                className="text-xs bg-white rounded-full ring-1 ring-neutral-200 px-3 py-1.5 hover:ring-violet-300 hover:text-violet-700 transition-all"
              >
                {m.name}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          {exact && (
            <button
              onClick={() => setView({ name: "detail", id: exact.id })}
              className="block w-full text-left surface-card-interactive p-6 mb-10 ring-2 ring-violet-200"
            >
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {exact.categories.map((c) => (
                  <CategoryTag key={c}>{c}</CategoryTag>
                ))}
              </div>
              <h2 className="font-serif-kr text-2xl mb-2">{exact.name}</h2>
              <p className="text-neutral-600">{exact.oneLiner}</p>
              <span className="inline-flex items-center gap-1 text-sm mt-3 text-violet-600 font-medium">
                상세 보기 <ChevronRight size={14} />
              </span>
            </button>
          )}
          {grouped.map((g) => (
            <div key={g.cat} className="mb-10">
              <h3 className="text-sm text-neutral-500 border-b border-neutral-200 pb-2 mb-4">{g.cat}</h3>
              <div className="grid sm:grid-cols-2 gap-3.5">
                {g.items.map((m) => (
                  <MemeCard key={m.id} meme={m} onOpen={(id) => setView({ name: "detail", id })} />
                ))}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
