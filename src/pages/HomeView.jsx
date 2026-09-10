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

export function HomeView({ setView }) {
  const [period, setPeriod] = useState("daily");
  const list = rankList(period).slice(0, 5);

  return (
    <div className="max-w-3xl mx-auto px-5">
      <section className="pt-20 pb-14 text-center">
        <h1 className="font-serif-kr text-black leading-tight">
          <span className="block text-3xl md:text-4xl">이게 무슨 밈이지?</span>
          <span className="block text-3xl md:text-4xl mt-1">요즘 이건 왜 유행해?</span>
        </h1>
        <div className="mt-10 max-w-xl mx-auto">
          <SearchBar onSearch={(q) => setView({ name: "search", query: q })} />
        </div>
        <div className="mt-4 flex items-center justify-center gap-2 flex-wrap">
          {["두쫀쿠", "야르", "킹받네"].map((k) => (
            <button
              key={k}
              onClick={() => setView({ name: "search", query: k })}
              className="text-xs text-gray-500 border border-gray-300 px-2.5 py-1 hover:border-black hover:text-black"
            >
              {k}
            </button>
          ))}
        </div>
      </section>

      <section className="border-t border-black pt-8 pb-20">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-serif-kr text-xl flex items-center gap-2">
            <TrendingUp size={18} /> 지금 사람들이 찾는 밈
          </h2>
          <PillTabs options={PERIODS} value={period} onChange={setPeriod} />
        </div>
        <ol className="divide-y divide-gray-200 border-t border-b border-gray-200">
          {list.map(({ meme, r, ch, isNew }) => (
            <li key={meme.id}>
              <button
                onClick={() => setView({ name: "detail", id: meme.id })}
                className="w-full flex items-center gap-4 py-4 text-left hover:bg-gray-50 px-2"
              >
                <span className="font-serif-kr text-2xl w-7 text-gray-300">{r}</span>
                <div className="flex-1">
                  <div className="text-black">{meme.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    검색량 {meme.popularity.search}K · 언급량 +{meme.popularity.buzz}%
                  </div>
                </div>
                <RankChange ch={ch} isNew={isNew} />
              </button>
            </li>
          ))}
        </ol>
        <p className="text-xs text-gray-400 mt-3">* 랭킹 수치는 초기 프로토타입용 Mock Data입니다.</p>
      </section>
    </div>
  );
}
