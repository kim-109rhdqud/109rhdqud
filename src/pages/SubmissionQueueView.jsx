import { useEffect, useState } from "react";
import { Inbox } from "lucide-react";
import { getSubmissionQueue, updateSubmissionStatus } from "../lib/api";
import { CategoryTag } from "../components/CategoryTag";
import { SubmissionCard } from "../components/SubmissionCard";
import { SubmissionStatusBadge } from "../components/SubmissionStatusBadge";

export function SubmissionQueueView({ user, setView }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSubmissionQueue()
      .then(setSubmissions)
      .catch(() => setSubmissions([]))
      .finally(() => setLoading(false));
  }, []);

  if (!user || !["editor", "admin"].includes(user.role)) {
    return <div className="max-w-md mx-auto px-5 py-20 text-center text-neutral-500">에디터 권한이 필요해.</div>;
  }

  // 낙관적으로 먼저 바꾸고, 실패하면 서버에서 다시 받아옴(AdminUsersView의 changeRole과 동일 패턴).
  // 되돌릴 스냅샷을 클로저로 들고 있으면 동시에 다른 항목을 처리 중일 때 그 변경까지 덮어써버려서 재조회 방식으로 함.
  const review = (id, status) => {
    setSubmissions((list) => list.map((s) => (s.id === id ? { ...s, status } : s)));
    updateSubmissionStatus(id, status).catch(() => {
      getSubmissionQueue().then(setSubmissions);
    });
  };

  const pending = submissions.filter((s) => s.status === "pending");
  const reviewed = submissions.filter((s) => s.status !== "pending");

  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      <h1 className="font-serif-kr text-3xl mb-1 flex items-center gap-2">
        <Inbox size={22} className="text-violet-500" /> 제보 승인
      </h1>
      <p className="text-sm text-neutral-400 mb-8">승인해도 밈이 자동으로 등록되진 않아 — 내용을 검수한 뒤 직접 등록해줘.</p>

      {loading ? (
        <p className="text-sm text-neutral-400">불러오는 중...</p>
      ) : submissions.length === 0 ? (
        <p className="text-sm text-neutral-400">들어온 제보가 없어.</p>
      ) : (
        <div className="space-y-8">
          {pending.length > 0 && (
            <section>
              <h2 className="text-xs text-neutral-400 mb-2.5">대기중 ({pending.length})</h2>
              <div className="surface-card divide-y divide-neutral-100 overflow-hidden">
                {pending.map((s) => (
                  <SubmissionCard
                    key={s.id}
                    submission={s}
                    topRight={<span className="text-xs text-neutral-400 shrink-0">{s.submittedBy?.nickname} 제보</span>}
                    footer={
                      <div className="flex gap-2 mt-3">
                        <button onClick={() => review(s.id, "approved")} className="btn-primary !py-1.5 !px-3.5 text-sm">
                          승인
                        </button>
                        <button onClick={() => review(s.id, "rejected")} className="btn-secondary !py-1.5 !px-3.5 text-sm">
                          반려
                        </button>
                      </div>
                    }
                  />
                ))}
              </div>
            </section>
          )}

          {reviewed.length > 0 && (
            <section>
              <h2 className="text-xs text-neutral-400 mb-2.5">처리 완료 ({reviewed.length})</h2>
              <div className="surface-card divide-y divide-neutral-100 overflow-hidden">
                {reviewed.map((s) => (
                  <div key={s.id} className="flex items-center justify-between gap-3 p-5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-neutral-700 truncate">{s.payload?.name}</span>
                      {s.payload?.category && <CategoryTag>{s.payload.category}</CategoryTag>}
                      <span className="text-xs text-neutral-400 shrink-0">{s.submittedBy?.nickname} 제보</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {s.status === "approved" && s.registeredMemeId && (
                        <button
                          onClick={() => setView({ name: "detail", id: s.registeredMemeId })}
                          className="text-xs text-emerald-600 hover:underline"
                        >
                          등록됨 · 보기
                        </button>
                      )}
                      {s.status === "approved" && !s.registeredMemeId && (
                        <button
                          onClick={() =>
                            setView({
                              name: "registerMeme",
                              prefill: {
                                submissionId: s.id,
                                name: s.payload?.name,
                                category: s.payload?.category,
                                oneLiner: s.payload?.oneLiner,
                                sourceUrl: s.payload?.sourceUrl,
                              },
                            })
                          }
                          className="btn-secondary !py-1 !px-2.5 text-xs"
                        >
                          밈으로 등록
                        </button>
                      )}
                      <SubmissionStatusBadge status={s.status} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
