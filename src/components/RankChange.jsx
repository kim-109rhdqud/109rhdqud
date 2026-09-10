import { ArrowDown, ArrowUp } from "lucide-react";

export function RankChange({ ch, isNew }) {
  if (isNew) return <span className="text-xs border border-black px-1">NEW</span>;
  if (ch === 0 || ch === null || ch === undefined) return <span className="text-xs text-gray-400">－</span>;
  if (ch > 0)
    return (
      <span className="inline-flex items-center gap-0.5 text-xs text-black">
        <ArrowUp size={12} strokeWidth={2.5} /> {ch}
      </span>
    );
  return (
    <span className="inline-flex items-center gap-0.5 text-xs text-gray-500">
      <ArrowDown size={12} strokeWidth={2.5} /> {Math.abs(ch)}
    </span>
  );
}
