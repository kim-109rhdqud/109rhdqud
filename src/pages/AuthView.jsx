import { useState } from "react";
import { login, signup } from "../lib/api";

const inputClass = "w-full border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-black";

export function AuthView({ setView, onAuth }) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [realName, setRealName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const user =
        mode === "login"
          ? await login({ username, password })
          : await signup({ username, password, nickname, email, realName, birthDate, phone });
      onAuth(user);
      setView({ name: "mypage" });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto px-5 py-16">
      <div className="flex border-b border-gray-200 mb-8">
        {["login", "signup"].map((m) => (
          <button
            key={m}
            onClick={() => {
              setMode(m);
              setError("");
            }}
            className={`flex-1 text-sm py-2.5 border-b-2 ${mode === m ? "border-black text-black" : "border-transparent text-gray-400"}`}
          >
            {m === "login" ? "로그인" : "회원가입"}
          </button>
        ))}
      </div>
      <form onSubmit={submit} className="space-y-3">
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="아이디"
          required
          className={inputClass}
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="비밀번호 (8자 이상)"
          required
          minLength={8}
          className={inputClass}
        />

        {mode === "signup" && (
          <>
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
            <label className="block">
              <span className="block text-xs text-gray-500 mb-1">생년월일</span>
              <input
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                type="date"
                required
                className={inputClass}
              />
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              type="tel"
              placeholder="휴대전화번호 (예: 010-1234-5678)"
              required
              className={inputClass}
            />
          </>
        )}

        {error && <p className="text-xs text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-black text-white py-2.5 text-sm mt-2 disabled:opacity-50"
        >
          {submitting ? "처리 중..." : mode === "login" ? "로그인" : "가입하기"}
        </button>
      </form>
    </div>
  );
}
