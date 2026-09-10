import { useState } from "react";

export function AuthView({ setView, onAuth }) {
  const [mode, setMode] = useState("login");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");

  const submit = (e) => {
    e.preventDefault();
    onAuth({ nickname: nickname || email.split("@")[0] || "사용자", email });
    setView({ name: "mypage" });
  };

  return (
    <div className="max-w-sm mx-auto px-5 py-16">
      <div className="flex border-b border-gray-200 mb-8">
        {["login", "signup"].map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 text-sm py-2.5 border-b-2 ${mode === m ? "border-black text-black" : "border-transparent text-gray-400"}`}
          >
            {m === "login" ? "로그인" : "회원가입"}
          </button>
        ))}
      </div>
      <form onSubmit={submit} className="space-y-3">
        {mode === "signup" && (
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="닉네임"
            required
            className="w-full border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-black"
          />
        )}
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="이메일"
          required
          className="w-full border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-black"
        />
        <input
          type="password"
          placeholder="비밀번호"
          required
          className="w-full border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-black"
        />
        <button type="submit" className="w-full bg-black text-white py-2.5 text-sm mt-2">
          {mode === "login" ? "로그인" : "가입하기"}
        </button>
      </form>
      <p className="text-xs text-gray-400 mt-4">
        프로토타입 버전이라 실제 인증 서버는 연결되어 있지 않아. 입력한 정보로 임시 세션만 만들어져.
      </p>
    </div>
  );
}
