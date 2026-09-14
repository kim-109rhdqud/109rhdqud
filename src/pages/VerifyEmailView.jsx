import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { verifyEmail, me } from "../lib/api";

export function VerifyEmailView({ token, setView, setUser }) {
  const [status, setStatus] = useState(token ? "pending" : "error"); // pending | done | error
  const [error, setError] = useState(token ? "" : "인증 토큰이 없어.");

  useEffect(() => {
    if (!token) return;
    verifyEmail(token)
      .then(() => me().then(setUser))
      .then(() => setStatus("done"))
      .catch((err) => {
        setStatus("error");
        setError(err.message);
      });
  }, [token, setUser]);

  return (
    <div className="max-w-sm mx-auto px-5 py-24 text-center">
      {status === "pending" && (
        <>
          <Loader2 size={28} className="animate-spin mx-auto mb-4 text-neutral-400" />
          <p className="text-neutral-500 text-sm">이메일 인증 확인 중...</p>
        </>
      )}
      {status === "done" && (
        <>
          <CheckCircle2 size={40} className="mx-auto mb-4 text-emerald-500" />
          <h1 className="font-serif-kr text-xl mb-2">이메일 인증 완료</h1>
          <p className="text-sm text-neutral-500 mb-6">이제 인증된 이메일로 표시돼.</p>
          <button onClick={() => setView({ name: "mypage" })} className="btn-primary">
            마이페이지로
          </button>
        </>
      )}
      {status === "error" && (
        <>
          <XCircle size={40} className="mx-auto mb-4 text-rose-500" />
          <h1 className="font-serif-kr text-xl mb-2">인증 실패</h1>
          <p className="text-sm text-neutral-500 mb-6">{error}</p>
          <button onClick={() => setView({ name: "mypage" })} className="btn-secondary">
            마이페이지로
          </button>
        </>
      )}
    </div>
  );
}
