import { useEffect, useState } from "react";
import { Megaphone } from "lucide-react";
import { getMySubmissions } from "../lib/api";
import { SubmissionCard } from "../components/SubmissionCard";
import { SubmissionStatusBadge } from "../components/SubmissionStatusBadge";

export function MySubmissionsView({ user, setView }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getMySubmissions()
      .then(setSubmissions)
      .catch(() => setSubmissions([]))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-5 py-20 text-center">
        <p className="text-neutral-600 mb-4">내 제보 목록을 보려면 로그인이 필요해.</p>
        <button onClick={() => setView({ name: "auth" })} className="btn-primary">
          로그인하러 가기
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      <div className="flex items-center justify-between gap-4 mb-1">
        <h1 className="font-serif-kr text-3xl">내 제보 목록</h1>
        <button onClick={() => setView({ name: "submit" })} className="btn-primary shrink-0 text-sm !py-2 !px-3.5">
          <Megaphone size={14} /> 제보하기
        </button>
      </div>
      <p className="text-sm text-neutral-500 mb-10">{user.nickname}님이 제보한 {submissions.length}건</p>

      {loading ? (
        <p className="text-sm text-neutral-400">불러오는 중...</p>
      ) : submissions.length === 0 ? (
        <div className="surface-card p-10 text-center">
          <p className="text-neutral-600 mb-4">아직 제보한 게 없어.</p>
          <button onClick={() => setView({ name: "submit" })} className="btn-secondary">
            첫 제보 하러 가기
          </button>
        </div>
      ) : (
        <div className="surface-card divide-y divide-neutral-100 overflow-hidden">
          {submissions.map((s) => (
            <SubmissionCard
              key={s.id}
              submission={s}
              topRight={<SubmissionStatusBadge status={s.status} />}
              footer={<p className="text-xs text-neutral-400 mt-2">{s.createdAt?.slice(0, 10)} 제보</p>}
            />
          ))}
        </div>
      )}
    </div>
  );
}
