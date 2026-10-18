// view state({ name, ...params }) ↔ 실제 URL 경로 매핑.
// 라우팅 라이브러리 없이 history.pushState/popstate로 처리(useAppState.js 참고) — 이 프로젝트가
// 지금까지 의존성을 최소로 유지해온 방향과 일치(docs/PROGRESS.md 설계 검토 결과).
//
// registerMeme의 prefill(제보 큐에서 넘어올 때 미리 채우는 이름/카테고리/한줄설명/출처)은 URL에 안 실림 —
// 새 탭에서 열거나 새로고침하면 빈 폼으로 시작함. 그 화면은 큐에서 버튼을 눌러 들어가는 일회성 작업
// 핸드오프라 북마크/공유 대상이 아니라서 괜찮다고 판단함.
const ROUTES = [
  { name: "home", pattern: /^\/$/, toPath: () => "/", fromMatch: () => ({ name: "home" }) },
  {
    name: "search",
    pattern: /^\/search$/,
    toPath: (v) => `/search${v.query ? `?q=${encodeURIComponent(v.query)}` : ""}`,
    fromMatch: (_m, params) => ({ name: "search", query: params.get("q") ?? "" }),
  },
  {
    name: "detail",
    pattern: /^\/meme\/([^/]+)$/,
    toPath: (v) => `/meme/${encodeURIComponent(v.id)}`,
    fromMatch: (m) => ({ name: "detail", id: decodeURIComponent(m[1]) }),
  },
  { name: "trend", pattern: /^\/trend$/, toPath: () => "/trend", fromMatch: () => ({ name: "trend" }) },
  { name: "dictionary", pattern: /^\/dictionary$/, toPath: () => "/dictionary", fromMatch: () => ({ name: "dictionary" }) },
  { name: "archive", pattern: /^\/archive$/, toPath: () => "/archive", fromMatch: () => ({ name: "archive" }) },
  { name: "auth", pattern: /^\/login$/, toPath: () => "/login", fromMatch: () => ({ name: "auth" }) },
  { name: "mypage", pattern: /^\/mypage$/, toPath: () => "/mypage", fromMatch: () => ({ name: "mypage" }) },
  { name: "editProfile", pattern: /^\/edit-profile$/, toPath: () => "/edit-profile", fromMatch: () => ({ name: "editProfile" }) },
  { name: "scraps", pattern: /^\/scraps$/, toPath: () => "/scraps", fromMatch: () => ({ name: "scraps" }) },
  { name: "admin", pattern: /^\/admin$/, toPath: () => "/admin", fromMatch: () => ({ name: "admin" }) },
  { name: "submit", pattern: /^\/submit$/, toPath: () => "/submit", fromMatch: () => ({ name: "submit" }) },
  {
    name: "mySubmissions",
    pattern: /^\/my-submissions$/,
    toPath: () => "/my-submissions",
    fromMatch: () => ({ name: "mySubmissions" }),
  },
  {
    name: "submissionQueue",
    pattern: /^\/submission-queue$/,
    toPath: () => "/submission-queue",
    fromMatch: () => ({ name: "submissionQueue" }),
  },
  {
    name: "registerMeme",
    pattern: /^\/register-meme$/,
    toPath: () => "/register-meme",
    fromMatch: () => ({ name: "registerMeme" }),
  },
];

const DEFAULT_VIEW = { name: "home" };

export function viewToPath(view) {
  const route = ROUTES.find((r) => r.name === view.name);
  return route ? route.toPath(view) : "/";
}

export function pathToView(pathname, searchParams) {
  for (const route of ROUTES) {
    const m = pathname.match(route.pattern);
    if (m) return route.fromMatch(m, searchParams);
  }
  return DEFAULT_VIEW;
}
