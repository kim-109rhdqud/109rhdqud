import { GRADES } from "../data/grades";

// 아카이브 등급(A/B/C) 배지. 인증마크(에메랄드, "근거 확인됨")와 다른 축("얼마나 널리 퍼졌나")이라
// 색도 구분 — 중립적인 슬레이트 톤에 등급별로 진하기만 다르게. 등급이 없으면 아무것도 안 그림.

const TONE = {
  A: "bg-slate-800 text-white ring-slate-800",
  B: "bg-slate-100 text-slate-700 ring-slate-300",
  C: "bg-white text-slate-500 ring-slate-200",
};

export function GradeBadge({ grade, compact = false }) {
  const g = GRADES[grade];
  if (!g) return null;
  return (
    <span title={g.desc} className={`pill ring-1 shrink-0 ${TONE[grade]}`}>
      {compact ? `${g.short}등급` : g.label}
    </span>
  );
}
