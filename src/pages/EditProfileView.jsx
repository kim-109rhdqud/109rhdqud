import { useEffect, useState } from "react";
import { updateMe, me, API_BASE_URL } from "../lib/api";

export function EditProfileView({ user, onUpdate, setView, linked, linkError }) {
  const [nickname, setNickname] = useState(user?.nickname ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [realName, setRealName] = useState(user?.realName ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // 카카오/구글 연동 직후 백엔드가 /edit-profile?linked=kakaoId로 되돌려보내는데,
  // 그 시점의 user 상태는 연동 전 값이라 kakaoLinked/googleLinked를 다시 받아와야 배지가 바로 반영됨.
  useEffect(() => {
    if (linked) me().then((u) => u && onUpdate(u));
  }, [linked, onUpdate]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-5 py-20 text-center">
        <p className="text-neutral-600 mb-4">로그인이 필요해.</p>
        <button onClick={() => setView({ name: "auth" })} className="btn-primary">
          로그인하러 가기
        </button>
      </div>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setDone(false);
    setSubmitting(true);
    try {
      const updated = await updateMe({ nickname, email, realName, phone });
      onUpdate(updated);
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto px-5 py-16">
      <h1 className="font-serif-kr text-3xl mb-1">내 정보 수정</h1>
      <p className="text-sm text-neutral-400 mb-8">아이디와 생년월일은 수정할 수 없어.</p>

      <div className="surface-card p-6 sm:p-7">
        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="block text-xs text-neutral-400 mb-1.5">아이디</span>
              <input value={user.username} disabled className="input-field bg-neutral-100 text-neutral-400 cursor-not-allowed" />
            </label>
            <label className="block">
              <span className="block text-xs text-neutral-400 mb-1.5">생년월일</span>
              <input
                value={user.birthDate?.slice(0, 10) ?? ""}
                disabled
                className="input-field bg-neutral-100 text-neutral-400 cursor-not-allowed"
              />
            </label>
          </div>

          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="닉네임"
            required
            className="input-field"
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="이메일"
            required
            className="input-field"
          />
          <input
            value={realName}
            onChange={(e) => setRealName(e.target.value)}
            placeholder="실명"
            required
            className="input-field"
          />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            type="tel"
            placeholder="휴대전화번호"
            required
            className="input-field"
          />

          {error && <p className="text-xs text-rose-600 bg-rose-50 rounded-lg px-3 py-2">{error}</p>}
          {done && <p className="text-xs text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">저장됐어.</p>}
          <button type="submit" disabled={submitting} className="btn-primary w-full mt-2 py-2.5">
            {submitting ? "저장 중..." : "저장하기"}
          </button>
        </form>
      </div>

      <div className="surface-card p-6 sm:p-7 mt-6">
        <h2 className="text-sm font-medium text-neutral-700 mb-1">계정 연동</h2>
        <p className="text-xs text-neutral-400 mb-4">연동해두면 다음부턴 소셜 로그인으로도 들어올 수 있어.</p>

        {linked && (
          <p className="text-xs text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2 mb-3">연동됐어.</p>
        )}
        {linkError && (
          <p className="text-xs text-rose-600 bg-rose-50 rounded-lg px-3 py-2 mb-3">
            이미 다른 계정에 연동된 소셜 계정이야.
          </p>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between rounded-xl ring-1 ring-neutral-200 px-4 py-2.5">
            <span className="text-sm text-neutral-700">카카오</span>
            {user.kakaoLinked ? (
              <span className="text-xs text-emerald-600">연동됨</span>
            ) : (
              <a href={`${API_BASE_URL}/auth/kakao`} className="text-xs text-violet-600 hover:underline">
                연동하기
              </a>
            )}
          </div>
          <div className="flex items-center justify-between rounded-xl ring-1 ring-neutral-200 px-4 py-2.5">
            <span className="text-sm text-neutral-700">구글</span>
            {user.googleLinked ? (
              <span className="text-xs text-emerald-600">연동됨</span>
            ) : (
              <a href={`${API_BASE_URL}/auth/google`} className="text-xs text-violet-600 hover:underline">
                연동하기
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
