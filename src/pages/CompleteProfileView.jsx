import { useState } from "react";
import { completeProfile } from "../lib/api";

// 카카오/구글로 바로 가입한 계정이 한 번 거치는 온보딩 — 일반 회원가입 폼이 받던
// 아이디/실명/생년월일/휴대전화(+이메일 없는 경우 이메일까지)를 여기서 채움.
// user.profileComplete가 false인 동안은 App.jsx가 다른 화면 대신 이걸 강제로 띄움.
export function CompleteProfileView({ user, onUpdate, setView, logout }) {
  const [username, setUsername] = useState("");
  const [realName, setRealName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(user?.email ?? "");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user?.profileComplete) {
    return (
      <div className="max-w-sm mx-auto px-5 py-24 text-center">
        <p className="text-neutral-500 text-sm mb-4">이미 가입이 완료된 계정이야.</p>
        <button onClick={() => setView({ name: "mypage" })} className="btn-primary">
          마이페이지로
        </button>
      </div>
    );
  }

  const needsEmail = !user?.email;

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const updated = await completeProfile({ username, realName, birthDate, phone, email: needsEmail ? email : undefined });
      onUpdate(updated);
      setView({ name: "mypage" });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto px-5 py-16">
      <div className="text-center mb-8">
        <span className="inline-block w-10 h-10 rounded-2xl brand-gradient mb-3" />
        <h1 className="font-serif-kr text-2xl">가입을 거의 다 했어요</h1>
        <p className="text-sm text-neutral-400 mt-1">{user?.nickname}님, 몇 가지만 더 입력하면 끝나요.</p>
      </div>

      <div className="surface-card p-6 sm:p-7">
        <form onSubmit={submit} className="space-y-3">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="아이디"
            required
            className="input-field"
          />
          {needsEmail && (
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="이메일"
              required
              className="input-field"
            />
          )}
          <input
            value={realName}
            onChange={(e) => setRealName(e.target.value)}
            placeholder="실명"
            required
            className="input-field"
          />
          <label className="block">
            <span className="block text-xs text-neutral-500 mb-1.5">생년월일</span>
            <input
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              type="date"
              required
              className="input-field"
            />
          </label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            type="tel"
            placeholder="휴대전화번호 (예: 010-1234-5678)"
            required
            className="input-field"
          />

          {error && <p className="text-xs text-rose-600 bg-rose-50 rounded-lg px-3 py-2">{error}</p>}
          <button type="submit" disabled={submitting} className="btn-primary w-full mt-2 py-2.5">
            {submitting ? "저장 중..." : "가입 완료"}
          </button>
        </form>
        <button onClick={logout} className="text-xs text-neutral-400 hover:text-neutral-600 w-full text-center mt-4">
          로그아웃
        </button>
      </div>
    </div>
  );
}
