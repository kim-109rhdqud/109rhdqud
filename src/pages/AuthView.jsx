import { useState } from "react";
import { login, signup } from "../lib/api";

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
      <div className="text-center mb-8">
        <span className="inline-block w-10 h-10 rounded-2xl brand-gradient mb-3" />
        <h1 className="font-serif-kr text-2xl">{mode === "login" ? "다시 만나서 반가워" : "유행도감에 합류하기"}</h1>
      </div>

      <div className="surface-card p-6 sm:p-7">
        <div className="flex gap-1 mb-6 bg-neutral-100 rounded-full p-1">
          {["login", "signup"].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m);
                setError("");
              }}
              className={`flex-1 text-sm py-2 rounded-full transition-all duration-150 ${
                mode === m ? "bg-white text-neutral-900 shadow-sm font-medium" : "text-neutral-400 hover:text-neutral-600"
              }`}
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
            className="input-field"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="비밀번호 (8자 이상)"
            required
            minLength={8}
            className="input-field"
          />

          {mode === "signup" && (
            <>
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
            </>
          )}

          {error && <p className="text-xs text-rose-600 bg-rose-50 rounded-lg px-3 py-2">{error}</p>}
          <button type="submit" disabled={submitting} className="btn-primary w-full mt-2 py-2.5">
            {submitting ? "처리 중..." : mode === "login" ? "로그인" : "가입하기"}
          </button>
        </form>
      </div>
    </div>
  );
}
