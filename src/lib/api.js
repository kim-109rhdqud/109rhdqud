// 백엔드(server/) API 호출용 얇은 fetch 래퍼.
// 인증은 httpOnly 쿠키 기반이라 매 요청에 credentials: "include"가 꼭 필요함 (docs/BACKEND.md 참고).
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const body = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    throw new Error(body?.error || "요청을 처리하지 못했어");
  }
  return body;
}

export function signup({ nickname, email, username, realName, birthDate, phone, password }) {
  return request("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ nickname, email, username, realName, birthDate, phone, password }),
  });
}

// 이메일이 아니라 아이디(username)로 로그인함.
export function login({ username, password }) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export function logout() {
  return request("/auth/logout", { method: "POST" });
}

export function updateMe({ nickname, email, realName, phone }) {
  return request("/auth/me", {
    method: "PATCH",
    body: JSON.stringify({ nickname, email, realName, phone }),
  });
}

// 로그인 안 된 상태면 서버가 401을 주는데, 이건 에러가 아니라 "로그아웃 상태"라는 정상적인 정보라서
// 예외를 던지지 않고 null을 반환함 (호출부에서 매번 try/catch 안 써도 되게).
export async function me() {
  try {
    return await request("/auth/me");
  } catch {
    return null;
  }
}
