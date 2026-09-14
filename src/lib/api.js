// 백엔드(server/) API 호출용 얇은 fetch 래퍼.
// 인증은 httpOnly 쿠키 기반이라 매 요청에 credentials: "include"가 꼭 필요함 (docs/BACKEND.md 참고).
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

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

export function completeProfile({ username, realName, birthDate, phone, email }) {
  return request("/auth/complete-profile", {
    method: "POST",
    body: JSON.stringify({ username, realName, birthDate, phone, email }),
  });
}

export function verifyEmail(token) {
  return request("/auth/verify-email", { method: "POST", body: JSON.stringify({ token }) });
}

export function resendVerificationEmail() {
  return request("/auth/resend-verification", { method: "POST" });
}

// 서버의 Meme 모델(popularity가 buzz/search/usage/trend로 평탄화, rank가 MemeRank[] 배열)을
// 프론트가 원래 쓰던 src/data/memes.js의 Mock 데이터 형태(popularity 객체, rank가 기간별 키 객체)로 맞춰줌.
// 이 변환 덕분에 페이지 컴포넌트들은 데이터 출처가 정적 import든 API든 신경 안 써도 됨.
function normalizeMeme(m) {
  return {
    ...m,
    popularity: { buzz: m.buzz, search: m.search, usage: m.usage, trend: m.trend },
    rank: Object.fromEntries((m.ranks ?? []).map((r) => [r.period, { r: r.rank, ch: r.change, isNew: r.isNew }])),
    verification: m.verification
      ? { ...m.verification, reviewedAt: m.verification.reviewedAt?.slice(0, 10) ?? null }
      : { verified: false, sources: [], changeLog: [] },
  };
}

export async function getMemes({ category, q } = {}) {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (q) params.set("q", q);
  const qs = params.toString();
  const memes = await request(`/memes${qs ? `?${qs}` : ""}`);
  return memes.map(normalizeMeme);
}

// 밈 등록(에디터 전용) — 제보 승인 후 실제 콘텐츠로 검수해 등록할 때 씀.
export async function createMeme(meme) {
  const created = await request("/memes", { method: "POST", body: JSON.stringify(meme) });
  return normalizeMeme(created);
}

// 인증마크 갱신(에디터 전용) — 호출마다 changeLog에 이력이 쌓임.
export function updateVerification(memeId, { verified, sources, copyrightHolder, note }) {
  return request(`/memes/${memeId}/verification`, {
    method: "PATCH",
    body: JSON.stringify({ verified, sources, copyrightHolder, note }),
  });
}

export async function getScraps() {
  const memes = await request("/scraps");
  return memes.map(normalizeMeme);
}

export function getUsers() {
  return request("/users");
}

export function updateUserRole(id, role) {
  return request(`/users/${id}/role`, { method: "PATCH", body: JSON.stringify({ role }) });
}

export function addScrap(memeId) {
  return request(`/scraps/${memeId}`, { method: "POST" });
}

export function removeScrap(memeId) {
  return request(`/scraps/${memeId}`, { method: "DELETE" });
}

export async function getRecentlyViewed() {
  const memes = await request("/recently-viewed");
  return memes.map(normalizeMeme);
}

export function recordRecentlyViewed(memeId) {
  return request(`/recently-viewed/${memeId}`, { method: "POST" });
}

export function createSubmission({ name, category, oneLiner, sourceUrl }) {
  return request("/submissions", {
    method: "POST",
    body: JSON.stringify({ name, category, oneLiner, sourceUrl }),
  });
}

// 전체 큐(에디터/관리자 전용) — 제보자 닉네임 포함.
export function getSubmissionQueue() {
  return request("/submissions");
}

// 역할 상관없이 항상 내 제보만.
export function getMySubmissions() {
  return request("/submissions/mine");
}

export function updateSubmissionStatus(id, status) {
  return request(`/submissions/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
}
