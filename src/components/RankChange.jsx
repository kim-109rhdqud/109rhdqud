import { ArrowDown, ArrowUp } from "lucide-react";

// 국내 차트/랭킹 서비스 관행대로 상승 = 빨강, 하락 = 파랑으로 표시.
export function RankChange({ ch, isNew }) {
  if (isNew) return <span className="pill brand-gradient text-white text-[10px] px-1.5 py-0.5">NEW</span>;
  if (ch === 0 || ch === null || ch === undefined) return <span className="text-xs text-neutral-300">－</span>;
  if (ch > 0)
    return (
      <span className="inline-flex items-center gap-0.5 text-xs font-medium text-rose-500">
        <ArrowUp size={12} strokeWidth={2.5} /> {ch}
      </span>
    );
  return (
    <span className="inline-flex items-center gap-0.5 text-xs font-medium text-blue-500">
      <ArrowDown size={12} strokeWidth={2.5} /> {Math.abs(ch)}
    </span>
  );
}
