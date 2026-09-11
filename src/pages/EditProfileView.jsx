import { useState } from "react";
import { updateMe } from "../lib/api";

const inputClass = "w-full border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-black";
const readOnlyClass = "w-full border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-500";

export function EditProfileView({ user, onUpdate, setView }) {
  const [nickname, setNickname] = useState(user?.nickname ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [realName, setRealName] = useState(user?.realName ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-5 py-20 text-center">
        <p className="text-gray-600 mb-4">로그인이 필요해.</p>
        <button
          onClick={() => setView({ name: "auth" })}
          className="border border-black px-4 py-2 text-sm hover:bg-black hover:text-white"
        >
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
      <p className="text-sm text-gray-500 mb-8">아이디와 생년월일은 수정할 수 없어.</p>

      <form onSubmit={submit} className="space-y-3">
        <label className="block">
          <span className="block text-xs text-gray-500 mb-1">아이디</span>
          <input value={user.username} disabled className={readOnlyClass} />
        </label>
        <label className="block">
          <span className="block text-xs text-gray-500 mb-1">생년월일</span>
          <input value={user.birthDate?.slice(0, 10) ?? ""} disabled className={readOnlyClass} />
        </label>

        <input
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="닉네임"
          required
          className={inputClass}
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="이메일"
          required
          className={inputClass}
        />
        <input
          value={realName}
          onChange={(e) => setRealName(e.target.value)}
          placeholder="실명"
          required
          className={inputClass}
        />
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          type="tel"
          placeholder="휴대전화번호"
          required
          className={inputClass}
        />

        {error && <p className="text-xs text-red-600">{error}</p>}
        {done && <p className="text-xs text-black">저장됐어.</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-black text-white py-2.5 text-sm mt-2 disabled:opacity-50"
        >
          {submitting ? "저장 중..." : "저장하기"}
        </button>
      </form>
    </div>
  );
}
