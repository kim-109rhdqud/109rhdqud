import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { login, signup } from "../lib/api";

const SUCCESS_DELAY_MS = 700;

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
  const [successUser, setSuccessUser] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const user =
        mode === "login"
          ? await login({ username, password })
          : await signup({ username, password, nickname, email, realName, birthDate, phone });
      // 로그인/가입 직후 바로 화면을 넘기지 않고, 짧게 성공했다는 걸 보여준 다음 이동함
      // — 아무 반응 없이 페이지가 툭 바뀌는 느낌을 없애려는 용도.
      setSuccessUser(user);
      setTimeout(() => {
        onAuth(user);
        setView({ name: "mypage" });
      }, SUCCESS_DELAY_MS);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  if (successUser) {
    return (
      <div className="max-w-sm mx-auto px-5 py-24 text-center">
        <div className="surface-card p-10">
          <span className="pop-in inline-flex w-14 h-14 rounded-full bg-emerald-50 text-emerald-500 items-center justify-center mb-4">
            <CheckCircle2 size={28} />
          </span>
          <p className="font-serif-kr text-lg text-neutral-900">
            {successUser.nickname}님, {mode === "login" ? "반가워요" : "환영해요"}!
          </p>
          <p className="text-sm text-neutral-400 mt-1">잠시만 기다려줘...</p>
        </div>
      </div>
    );
  }

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
