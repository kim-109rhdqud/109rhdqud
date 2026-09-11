import { useState } from "react";
import { PillTabs } from "../components/PillTabs";
import { RankChange } from "../components/RankChange";
import { CATEGORIES } from "../data/memes";
import { unifiedRankList } from "../data/rank";

const PERIODS = [
  { key: "daily", label: "오늘" },
  { key: "weekly", label: "이번 주" },
  { key: "monthly", label: "이번 달" },
  { key: "yearly", label: "올해" },
  { key: "custom", label: "직접 설정" },
];

export function TrendView({ setView }) {
  const [period, setPeriod] = useState("daily");
  const [cat, setCat] = useState("전체");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  let list = unifiedRankList(period, customStart, customEnd);
  if (cat !== "전체") list = list.filter(({ meme }) => meme.categories.includes(cat));

  const catOptions = ["전체", ...CATEGORIES.filter((c) => c !== "영상" && c !== "기타")].map((c) => ({
    key: c,
    label: c,
  }));

  return (
    <div className="max-w-4xl mx-auto px-5 py-10">
      <h1 className="font-serif-kr text-3xl mb-1">트렌드</h1>
      <p className="text-sm text-neutral-400 mb-6">기간·카테고리별로 지금 유행하는 것들을 순위로 확인해봐.</p>
      <div className="mb-3">
        <PillTabs options={PERIODS} value={period} onChange={setPeriod} />
      </div>
      {period === "custom" && (
        <div className="flex items-center gap-2 mb-4 text-sm text-neutral-600">
          <input
            type="date"
            value={customStart}
            onChange={(e) => setCustomStart(e.target.value)}
            className="input-field w-auto"
          />
          <span className="text-neutral-300">~</span>
          <input
            type="date"
            value={customEnd}
            onChange={(e) => setCustomEnd(e.target.value)}
            className="input-field w-auto"
          />
        </div>
      )}
      <div className="mb-6">
        <PillTabs options={catOptions} value={cat} onChange={setCat} variant="outline" />
      </div>

      {period === "custom" && (!customStart || !customEnd) ? (
        <p className="text-sm text-neutral-400 surface-card p-6 text-center">
          시작일과 종료일을 선택하면 해당 기간의 순위를 보여줄게.
        </p>
      ) : (
        <div className="surface-card divide-y divide-neutral-100 overflow-hidden">
          {list.map(({ meme, r, ch, isNew, search, buzz }) => (
            <button
              key={meme.id}
              onClick={() => setView({ name: "detail", id: meme.id })}
              className="flex items-center gap-4 w-full text-left py-4 px-4 hover:bg-neutral-50 transition-colors"
            >
              <span className="w-7 shrink-0 text-lg text-neutral-300 font-serif-kr">{r}</span>
              <div className="flex-1 min-w-0">
                <div className="text-neutral-900 font-medium">{meme.name}</div>
                <div className="text-xs text-neutral-400 mt-0.5 truncate">{meme.oneLiner}</div>
              </div>
              <div className="shrink-0 flex items-center gap-1.5 text-xs text-neutral-500 whitespace-nowrap">
                <span>검색량 {search}K</span>
                <span className="text-neutral-300">·</span>
                <span>화제성 {buzz}</span>
                <RankChange ch={ch} isNew={isNew} />
              </div>
            </button>
          ))}
        </div>
      )}
      <p className="text-xs text-neutral-400 mt-3">
        * 모든 순위·지표는 Mock Data입니다{period === "custom" && " (직접 설정 기간은 임의로 생성된 값)"}.
      </p>
    </div>
  );
}
