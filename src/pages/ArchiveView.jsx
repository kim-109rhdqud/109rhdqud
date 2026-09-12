import { useState } from "react";
import { MockTag } from "../components/MockTag";
import { PillTabs } from "../components/PillTabs";
const ARCHIVE_YEARS = Array.from({ length: 2025 - 2000 + 1 }, (_, i) => 2000 + i);
const YEAR_OPTIONS = ARCHIVE_YEARS.map((y) => ({ key: y, label: String(y) }));

function monthHighlight(memes, year, month) {
  const prefix = `${year}.${String(month).padStart(2, "0")}`;
  for (const m of memes) {
    const hit = m.timeline.find((t) => t.date === prefix);
    if (hit) return { meme: m, text: hit.text };
  }
  return null;
}

export function ArchiveView({ setView, memes }) {
  const [year, setYear] = useState(2025);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      <h1 className="font-serif-kr text-3xl mb-6">역사</h1>
      <div className="pb-4 mb-8 border-b border-neutral-200">
        <PillTabs options={YEAR_OPTIONS} value={year} onChange={setYear} wrap={false} shrink />
      </div>

      <div className="flex items-center gap-2 mb-1">
        <h2 className="font-serif-kr text-2xl">{year}년 인터넷 연감</h2>
        <MockTag />
      </div>
      <p className="text-sm text-neutral-400 mb-6">그 해 대한민국 인터넷을 채웠던 흐름을 월별로 정리했어.</p>

      <div className="surface-card divide-y divide-neutral-100 overflow-hidden">
        {months.map((m) => {
          const hit = monthHighlight(memes, year, m);
          return (
            <div key={m} className="py-4 px-5">
              <div className="text-xs text-neutral-400 mb-1">
                {year}년 {m}월
              </div>
              {hit ? (
                <button
                  onClick={() => setView({ name: "detail", id: hit.meme.id })}
                  className="text-left group"
                >
                  <span className="text-neutral-900 font-medium group-hover:brand-gradient-text transition-all">{hit.meme.name}</span>
                  <span className="block text-xs text-neutral-500 mt-0.5">{hit.text}</span>
                </button>
              ) : (
                <span className="text-neutral-300">○○</span>
              )}
            </div>
          );
        })}
      </div>
      <p className="text-xs text-neutral-400 mt-3">
        * ○○는 아직 기록이 등록되지 않은 달이야. 채워진 항목도 프로토타입용 Mock Data라 실제 역사적 사실이 아니야.
      </p>
    </div>
  );
}
