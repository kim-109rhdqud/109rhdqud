export function rankList(memes, period) {
  return memes
    .filter((m) => m.rank[period])
    .map((m) => ({ meme: m, ...m.rank[period], search: m.popularity.search, buzz: m.popularity.buzz }))
    .sort((a, b) => a.r - b.r);
}

/* 사용자가 직접 고른 기간의 순위는 실제 데이터가 없으므로, 기간 문자열을 시드로 한
   결정론적 의사난수로 검색량·화제성을 만들어 보여준다 (Mock Data). */
function hashSeed(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}
function seededValue(seed, min, max) {
  return min + (hashSeed(seed) % (max - min + 1));
}
function customRankList(memes, start, end) {
  const rows = memes.map((m) => {
    const search = seededValue(`${m.id}-search-${start}-${end}`, 30, 99);
    const buzz = seededValue(`${m.id}-buzz-${start}-${end}`, 20, 95);
    const prevSearch = seededValue(`${m.id}-search-prev-${start}-${end}`, 30, 99);
    const prevBuzz = seededValue(`${m.id}-buzz-prev-${start}-${end}`, 20, 95);
    return { meme: m, search, buzz, score: search + buzz, prevScore: prevSearch + prevBuzz };
  });
  const sorted = [...rows].sort((a, b) => b.score - a.score).map((row, i) => ({ ...row, r: i + 1 }));
  const prevOrder = [...rows].sort((a, b) => b.prevScore - a.prevScore).map((row, i) => ({ id: row.meme.id, r: i + 1 }));
  return sorted.map((row) => {
    const prevRank = prevOrder.find((p) => p.id === row.meme.id)?.r ?? row.r;
    return { ...row, ch: prevRank - row.r, isNew: false };
  });
}
export function unifiedRankList(memes, period, customStart, customEnd) {
  if (period === "custom") {
    if (!customStart || !customEnd) return [];
    return customRankList(memes, customStart, customEnd);
  }
  return rankList(memes, period);
}
