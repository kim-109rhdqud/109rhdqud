// 제보 상태 배지 — 내 제보 목록/에디터 승인 큐 둘 다에서 재사용.
const STATUS = {
  pending: { label: "대기중", color: "bg-amber-50 text-amber-700" },
  approved: { label: "승인됨", color: "bg-emerald-50 text-emerald-700" },
  rejected: { label: "반려됨", color: "bg-neutral-100 text-neutral-500" },
};

export function SubmissionStatusBadge({ status }) {
  const { label, color } = STATUS[status] ?? STATUS.pending;
  return <span className={`pill ${color}`}>{label}</span>;
}
