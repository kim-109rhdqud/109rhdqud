import { CategoryTag } from "./CategoryTag";

// 제보 상세 카드(이름/카테고리/한줄설명/출처 링크) — 내 제보 목록과 승인 큐의 "대기중" 섹션에서 공통으로 씀.
// 화면마다 오른쪽 상단/하단에 다른 액션이 붙어서 그 부분만 슬롯으로 뺌.
export function SubmissionCard({ submission: s, topRight, footer }) {
  return (
    <div className="p-5">
      <div className="flex items-center justify-between gap-3 mb-1.5">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-medium text-neutral-900 truncate">{s.payload?.name}</span>
          {s.payload?.category && <CategoryTag>{s.payload.category}</CategoryTag>}
        </div>
        {topRight}
      </div>
      <p className="text-sm text-neutral-500 mb-1.5">{s.payload?.oneLiner}</p>
      {s.payload?.sourceUrl && (
        <a
          href={s.payload.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-violet-600 hover:underline break-all"
        >
          {s.payload.sourceUrl}
        </a>
      )}
      {footer}
    </div>
  );
}
