// 카테고리마다 색을 다르게 줘서 한눈에 구분되게 함 — 색상 수를 제한해서 화면이 산만해지진 않게 함.
const CATEGORY_COLORS = {
  밈: "bg-violet-50 text-violet-700",
  유행어: "bg-blue-50 text-blue-700",
  상품: "bg-amber-50 text-amber-700",
  인물: "bg-rose-50 text-rose-700",
  챌린지: "bg-emerald-50 text-emerald-700",
  영상: "bg-fuchsia-50 text-fuchsia-700",
  기타: "bg-neutral-100 text-neutral-600",
};

export function CategoryTag({ children }) {
  const colorClass = CATEGORY_COLORS[children] ?? CATEGORY_COLORS.기타;
  return <span className={`pill ${colorClass}`}>{children}</span>;
}
