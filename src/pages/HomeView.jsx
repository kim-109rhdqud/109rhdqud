import { useState } from "react";
import { TrendingUp } from "lucide-react";
import { SearchBar } from "../components/SearchBar";
import { PillTabs } from "../components/PillTabs";
import { RankChange } from "../components/RankChange";
import { rankList } from "../data/rank";

const PERIODS = [
  { key: "daily", label: "일간" },
  { key: "weekly", label: "주간" },
  { key: "yearly", label: "연간" },
];

const RANK_BADGE = [
  "brand-gradient text-white shadow-[0_4px_14px_-4px_rgba(124,58,237,0.6)]",
  "bg-neutral-200 text-neutral-700",
  "bg-amber-100 text-amber-800",
];

export function HomeView({ setView, memes }) {
  const [period, setPeriod] = useState("daily");
  const list = rankList(memes, period).slice(0, 5);

  return (
    <div className="max-w-3xl mx-auto px-5">
      <section className="relative pt-24 pb-16 text-center overflow-hidden">
        {/* 은은하게 흐린 그라데이션 블롭 — 배경에 깊이감을 주되 텍스트 가독성은 안 건드림 */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[560px] h-[320px] rounded-full bg-gradient-to-br from-violet-400 via-fuchsia-300 to-rose-300 opacity-25 blur-3xl pointer-events-none" />

        <div className="relative">
          <h1 className="font-serif-kr text-black leading-tight">
            <span className="block text-3xl md:text-5xl">이게 무슨 밈이지?</span>
            <span className="block text-3xl md:text-5xl mt-1">
              요즘 이건 <span className="brand-gradient-text">왜 유행</span>해?
            </span>
          </h1>
          <p className="mt-4 text-neutral-500 text-sm md:text-base">
            흩어진 밈·유행어·상품 트렌드를 한 곳에서, 검증까지 함께.
          </p>
          <div className="mt-9 max-w-xl mx-auto">
            <SearchBar onSearch={(q) => setView({ name: "search", query: q })} memes={memes} />
          </div>
          <div className="mt-4 flex items-center justify-center gap-2 flex-wrap">
            {["두쫀쿠", "야르", "킹받네"].map((k) => (
              <button
                key={k}
                onClick={() => setView({ name: "search", query: k })}
                className="text-xs text-neutral-500 bg-white rounded-full ring-1 ring-neutral-200 px-3 py-1.5 shadow-sm hover:ring-violet-300 hover:text-violet-700 hover:-translate-y-0.5 transition-all duration-150"
              >
                {k}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-serif-kr text-xl flex items-center gap-2">
            <TrendingUp size={18} className="text-fuchsia-500" /> 지금 사람들이 찾는 밈
          </h2>
          <PillTabs options={PERIODS} value={period} onChange={setPeriod} />
        </div>
        <div className="surface-card divide-y divide-neutral-100 overflow-hidden">
          {list.map(({ meme, r, ch, isNew }, i) => (
            <button
              key={meme.id}
              onClick={() => setView({ name: "detail", id: meme.id })}
              className="w-full flex items-center gap-4 py-4 px-4 text-left hover:bg-neutral-50 transition-colors"
            >
              <span
                className={`font-serif-kr text-sm w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                  RANK_BADGE[i] ?? "text-neutral-300 bg-transparent"
                }`}
              >
                {r}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-neutral-900 font-medium truncate">{meme.name}</div>
                <div className="text-xs text-neutral-400 mt-0.5">
                  검색량 {meme.popularity.search}K · 언급량 +{meme.popularity.buzz}%
                </div>
              </div>
              <RankChange ch={ch} isNew={isNew} />
            </button>
          ))}
        </div>
        <p className="text-xs text-neutral-400 mt-3">* 랭킹 수치는 초기 프로토타입용 Mock Data입니다.</p>
      </section>
    </div>
  );
}
