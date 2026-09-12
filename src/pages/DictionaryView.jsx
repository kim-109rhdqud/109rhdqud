import { useState } from "react";
import { MemeCard } from "../components/MemeCard";
import { PillTabs } from "../components/PillTabs";
import { CATEGORIES } from "../data/memes";

export function DictionaryView({ setView, memes }) {
  const [sort, setSort] = useState("popular");
  const [cat, setCat] = useState("전체");
  const [q, setQ] = useState("");

  let list = memes.filter((m) => (cat === "전체" || m.categories.includes(cat)) && m.name.includes(q.trim()));
  if (sort === "popular") list = [...list].sort((a, b) => b.popularity.buzz - a.popularity.buzz);
  if (sort === "recent") list = [...list].sort((a, b) => (a.rank.daily.r ?? 999) - (b.rank.daily.r ?? 999));
  if (sort === "alpha") list = [...list].sort((a, b) => a.name.localeCompare(b.name, "ko"));
  if (sort === "registered") list = [...list].sort((a, b) => new Date(b.registeredAt) - new Date(a.registeredAt));

  const catOptions = ["전체", ...CATEGORIES.filter((c) => c !== "영상" && c !== "기타")].map((c) => ({
    key: c,
    label: c,
  }));

  return (
    <div className="max-w-4xl mx-auto px-5 py-10">
      <h1 className="font-serif-kr text-3xl mb-6">밈 사전</h1>
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between mb-4">
        <PillTabs options={catOptions} value={cat} onChange={setCat} variant="outline" />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="input-field w-auto py-1.5 bg-white"
        >
          <option value="recent">최근 유행순</option>
          <option value="popular">인기순</option>
          <option value="alpha">가나다순</option>
          <option value="registered">최신 등록순</option>
        </select>
      </div>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="사전 안에서 검색"
        className="input-field mb-6"
      />
      {list.length === 0 ? (
        <p className="text-sm text-neutral-400 surface-card p-8 text-center">조건에 맞는 항목이 없어.</p>
      ) : (
        <div className="grid sm:grid-cols-3 gap-3.5">
          {list.map((m) => (
            <MemeCard key={m.id} meme={m} onOpen={(id) => setView({ name: "detail", id })} />
          ))}
        </div>
      )}
    </div>
  );
}
