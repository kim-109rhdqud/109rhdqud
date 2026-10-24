# 유행도감 (Trend Encyclopedia)

요즘 유행하는 밈·유행어·상품·인물·챌린지를 검색하고 둘러볼 수 있는 React 웹앱. 프로토타입 단계에서 실제 배포 단계로 전환 중 — 로그인/회원가입, 밈 데이터 조회, 스크랩, 최근 본 밈, 사용자 역할 관리, 제보(밈 제안)와 승인된 제보의 실제 밈 등록, 인증마크 갱신까지 전부 실제 백엔드에 연동되고 curl로 실동작 확인 완료. 실제 URL 라우팅(`history.pushState`)도 구현 완료. **배포 완료** — 백엔드는 Render(`https://trend-book.onrender.com`), 프론트는 Vercel(`https://109rhdqud.vercel.app`)에 떠 있고 실제 브라우저로 로그인/밈 사전 조회/상세 페이지 새로고침(라우팅)/스크랩까지 end-to-end 확인 완료(2026-09-14). 실제 트렌드 애널리틱스는 아직임(자세한 내용은 [docs/PROGRESS.md](docs/PROGRESS.md) 참고).

## 기술 스택
- 프론트: React 19 + Vite, Tailwind CSS 4 (`@tailwindcss/vite` 플러그인), lucide-react(아이콘), oxlint(린트, TypeScript 아님 — 순수 JSX)
- 백엔드(`server/`, 2026-09-11 추가, 구현 진행 중): Node + Express, Prisma(ORM), Neon(PostgreSQL 호스팅) — 표준 TCP(5432) 대신 `@prisma/adapter-neon` + `@neondatabase/serverless`로 HTTP/WebSocket(443) 기반 접속을 씀(원래 5432가 막힌 PC방 네트워크 때문에 도입, 지금은 어디서든 그냥 동작하니 유지). 인증은 bcryptjs + jsonwebtoken(httpOnly 쿠키). 결정 배경은 [docs/BACKEND.md](docs/BACKEND.md) 참고.

## 작업 환경
- **2026-10-18부터 클라우드 Claude Code(리눅스 컨테이너)에서 작업함.** 그 전 PC방(Windows) 작업 때의 우회법(cmd.exe 차단, `net use` 패치, `--ignore-scripts` 등)은 [docs/WINDOWS_PC_NOTES.md](docs/WINDOWS_PC_NOTES.md)로 옮김 — 클라우드에선 해당 없음, 다시 Windows PC에서 작업할 때만 볼 것.
- 세션마다 새 컨테이너라 `node_modules`가 없음 → **`.claude/hooks/session-start.sh`가 세션 시작 시 루트·`server/` 의존성을 자동 설치**(`npm ci`, 서버는 postinstall로 `prisma generate`까지). `npm install` 대신 `ci`를 쓰는 건 컨테이너의 npm 버전이 달라서 install이 `package-lock.json`을 매번 다시 써버리기 때문(libc 필드 등) — lock 파일이 바뀌어 있으면 커밋하지 말고 되돌릴 것.
- 세션이 끝나면 컨테이너가 사라짐 → **작업은 항상 commit + push.** 지정된 작업 브랜치에서 하고 PR로 `main`에 머지 — Render(백엔드)·Vercel(프론트)이 `main`을 자동 배포함.
- 네트워크는 2026-10-23부터 전체 허용이라 운영 서버(`trend-book.onrender.com`) 확인은 컨테이너에서 바로 됨. **운영 DB(Neon) 접근은 `DATABASE_URL` 환경변수가 있어야 함** — 환경 설정에 넣어두면 됨(비밀번호가 들어 있으니 채팅에 붙여넣지 말 것). 아웃바운드가 HTTP 프록시를 거쳐서 **Neon WebSocket(`Pool`)은 안 되고 HTTP 모드(`neon()`) + `NODE_USE_ENV_PROXY=1`만 됨**, `psql`(5432)도 안 됨. 운영 DB를 바꾸는 작업은 실행 전에 사용자에게 먼저 확인할 것.
- **기능 검증은 컨테이너 안 로컬 Postgres로 가능** — PostgreSQL 16이 깔려 있음(`pg_ctlcluster 16 main start`). 서버의 `src/lib/prisma.js`는 Neon 어댑터라 로컬 Postgres엔 그대로 못 붙으므로, 레포 파일은 건드리지 말고 `server/`를 스크래치 디렉토리로 복사해 그 사본의 `prisma.js`만 어댑터 없는 `new PrismaClient()`로 바꿔서 `prisma db push` → `node prisma/seed.js` → 서버 띄워서 API 시나리오를 돌림(2026-10-18 밈 수정/삭제·보안 패치 검증 때 이 방식 사용). 끝나면 테스트 DB 삭제·Postgres 정지.

## 실행 명령어
프론트(레포 루트에서):
- `npm run dev` — 개발 서버
- `npm run build` — 프로덕션 빌드
- `npm run lint` — oxlint 실행
- `npm run preview` — 빌드 결과 미리보기

백엔드(`server/` 디렉토리에서):
- `npm start` (= `node src/index.js`) — API 서버 실행 (기본 포트 4000). `server/.env.example`을 `server/.env`로 복사하고 `DATABASE_URL`/`JWT_SECRET` 등을 채워야 함(git에 안 잡힘)
- `npx prisma generate` — Prisma Client 생성 (스키마만 읽음, DB 연결 불필요). `npm install`/`npm ci` 시 postinstall로 자동 실행됨
- `node prisma/seed.js` — 기존 Mock 데이터(`src/data/memes.js`)를 DB로 이관하는 시드 스크립트

## DB 스키마 변경 (마이그레이션)
- **`prisma migrate dev`/`deploy`는 쓰지 않음** — 마이그레이션 엔진은 어댑터를 안 타고 TCP(5432)로 직접 붙는데, 5432가 막힌 네트워크가 있어서(PC방, 지금 클라우드 환경도 운영 DB 접속 불가) 어디서든 되는 수동 방식으로 통일함. 스키마를 바꿨으면:
  1. **최초 스키마(테이블이 하나도 없는 상태)일 때만** `--from-empty` 사용: `npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script`. **이미 테이블이 있는 상태에서 스키마를 추가/변경할 때는 `--from-empty` 쓰면 안 됨** — 기존 테이블까지 처음부터 다시 `CREATE TABLE`하는 SQL이 나와서 이미 있는 테이블과 충돌함(2026-09-12 발견).
     증분 SQL 생성 시 `--from-migrations prisma/migrations --to-schema-datamodel prisma/schema.prisma --script`를 쓰고 싶어지는데, **이건 실제로 안 됨(2026-09-13 발견)** — `--from-migrations`/`--to-migrations`는 내부적으로 마이그레이션 히스토리를 재생해볼 shadow database가 필요해서 `--shadow-database-url`을 요구하고, 이것도 결국 5432 TCP 접속임. **대신**: 현재 라이브 DB 상태를 반영하는 "변경 전" 스키마 스냅샷을 임시 파일로 만들어서(즉, `prisma/schema.prisma`에서 이번에 추가/변경한 모델·필드만 빼거나 되돌린 사본) `--from-schema-datamodel <임시 파일 경로> --to-schema-datamodel prisma/schema.prisma --script`로 두 스키마 파일끼리 비교할 것 — 정적 파일 비교라 DB/shadow db가 전혀 필요 없음(완전 오프라인).
  2. 그 SQL을 `server/prisma/migrations/<타임스탬프>_<이름>/migration.sql`로 저장하고(타임스탬프는 기존 폴더명 `YYYYMMDDHHMMSS_설명` 형식), 운영 DB에 적용: `DATABASE_URL`이 있는 환경이면 `NODE_USE_ENV_PROXY=1 node prisma/apply-migration.js prisma/migrations/<폴더>/migration.sql`(443 포트, Neon HTTP 모드 — 클라우드 컨테이너의 HTTP 프록시를 WebSocket이 못 타서 `Pool` 대신 `neon()`을 씀, 2026-10-24), 없으면 Neon 웹 콘솔 SQL Editor에 붙여넣어 실행. **운영 서버가 아직 옛 코드면 컬럼 삭제 같은 SQL은 배포가 끝난 다음에 실행할 것** — 순서가 바뀌면 옛 코드가 없는 컬럼을 조회해서 운영이 깨짐(2026-10-18).
  - `prisma/migrations/migration_lock.toml`(내용: `provider = "postgresql"` 한 줄)이 없으면 `migrate diff`류 명령이 "missing migration_lock.toml" 에러를 냄 — 이미 만들어둠, 지우지 말 것.
  3. `_prisma_migrations` 이력 테이블엔 안 남으므로, 5432가 뚫리는 환경에서 작업할 기회가 있으면 그때 `prisma migrate resolve --applied <migration명>`으로 한 번 동기화해줄 것.

## 현재 아키텍처
- [src/App.jsx](src/App.jsx)는 얇은 셸(shell)만 담당 — `useAppState` 훅으로 상태를 받아 NavBar와 현재 view에 맞는 페이지를 렌더링.
- `src/data/memes.js` — `CATEGORIES`(프론트가 여전히 정적 import로 씀, 고정 taxonomy라 DB 이관 대상 아님)와 `MEMES`/`memeById`(더 이상 프론트가 안 씀 — `server/prisma/seed.js`가 DB 시드용으로만 import함. 지우면 안 됨, 재시드할 방법이 없어짐). `src/data/rank.js`는 `memes` 배열을 인자로 받는 순수 함수(`rankList`/`unifiedRankList`)로 바뀜 — 더 이상 MEMES를 직접 import 안 함.
- `src/lib/api.js` — 백엔드(`server/`) API 호출용 fetch 래퍼. `credentials: "include"` 필수(httpOnly 쿠키 인증). `VITE_API_URL` 환경변수로 백엔드 주소 지정(루트 `.env`, `.env.example` 참고). `getMemes`/`createMeme`/`updateMeme`/`deleteMeme`/`getScraps`/`addScrap`/`removeScrap`/`getRecentlyViewed`/`recordRecentlyViewed`/`getUsers`/`updateUserRole`/`createSubmission`/`getMySubmissions`/`getSubmissionQueue`/`updateSubmissionStatus`/`updateVerification` 등 보유. `normalizeMeme()`가 서버 응답 모양(평탄화된 buzz/search/usage/trend, ranks 배열)을 프론트가 쓰는 형태(`popularity` 객체, `rank`가 기간별 키 객체)로 맞춰줌 — 밈 관련 API를 새로 추가할 때 이 정규화 패턴을 재사용할 것.
- `src/hooks/useAppState.js` — view/user/memes/scraps/recentlyViewed 상태 관리. `memes`는 앱 로드 시 `GET /memes`로 한 번 fetch(`memeById`는 이 배열에서 찾는 파생 함수, `refreshMemes`는 밈 등록 직후처럼 새로고침 없이 목록을 다시 받아와야 할 때 씀). `scraps`·`recentlyViewed` 둘 다 로그인 상태일 때만 서버에서 채워지고 서버가 정본(비로그인이면 아예 추적 안 함 — 로그인 화면으로 유도, 마이페이지가 어차피 로그인 필수라 도달 불가능한 경우라 단순화). `localStorage`는 이제 이 앱에서 전혀 안 씀(`src/lib/storage.js`도 삭제됨). `user`도 localStorage에 안 남기고 앱 로드 시 `GET /auth/me`로 채움.
- `src/components/` — 여러 페이지에서 재사용되는 작은 UI 조각(Logo, NavBar, SearchBar, MemeCard, CategoryTag, MockTag, RankChange, MetricBar, Sparkline, SectionHeading, PillTabs, VerificationBadge, VerificationEditForm, SubmissionCard, SubmissionStatusBadge 등)
- `src/pages/` — 화면 단위 뷰 컴포넌트 (HomeView, SearchResultsView, DetailView, TrendView, DictionaryView, ArchiveView, AuthView, MyPageView, ScrapsView, EditProfileView, AdminUsersView, SubmitMemeView, MySubmissionsView, SubmissionQueueView, RegisterMemeView)
- 라우팅 라이브러리 없이 `view` state 객체(`{ name: "home" | "search" | "detail" | "trend" | "dictionary" | "archive" | "auth" | "mypage" | "scraps" | "admin" | "submit" | "mySubmissions" | "submissionQueue" | "registerMeme" | "editMeme", ...params }`)로 화면 전환하고, [src/lib/routes.js](src/lib/routes.js)가 이 view ↔ 실제 URL 경로(`/meme/:id`, `/meme/:id/edit`, `/trend` 등)를 매핑함 — `history.pushState`/`popstate` 기반이라 뒤로가기·새로고침·링크 공유 다 동작(배포 시 `vercel.json`의 SPA rewrite로 딥링크 처리).
- **로그인/회원가입은 2026-09-11부터 실제 백엔드(`server/`)에 연동됨** — `src/lib/api.js`가 `/auth/*` API를 호출하고, 세션은 서버가 발급하는 httpOnly 쿠키로 관리(`useAppState`가 앱 로드 시 `GET /auth/me`로 로그인 여부 확인). 더 이상 Mock 아님. **로그인은 이메일이 아니라 아이디(username) 기준**이고, 회원가입 시 닉네임/이메일/아이디/실명/생년월일/휴대전화번호를 전부 입력받음(`src/pages/AuthView.jsx`). 마이페이지에서 "내 정보 수정"(`src/pages/EditProfileView.jsx`)으로 닉네임/이메일/실명/휴대전화번호 수정 가능 — 아이디·생년월일은 불변.
- **밈 데이터(2026-09-12)와 스크랩(2026-09-12)은 실제 백엔드 API로 연동 완료.** 밈 데이터는 `GET /memes`(목록), 스크랩은 로그인 필요 `GET/POST/DELETE /scraps`.
- **최근 본 밈(2026-09-13)** — `GET/POST /recently-viewed`(로그인 필요, 최근 5개, `(userId,memeId)` upsert로 중복 없이 viewedAt만 갱신), `useAppState`가 스크랩과 동일 패턴으로 처리. DB 마이그레이션 적용 + curl로 인증 가드/기록/정렬/5개 제한까지 실동작 확인 완료.
- **사용자 역할 관리(2026-09-12) 추가** — admin 계정이 `GET /users`(목록)·`PATCH /users/:id/role`(역할 변경)로 다른 유저를 editor/admin으로 승격 가능. 프론트는 [AdminUsersView](src/pages/AdminUsersView.jsx)(관리자만 접근, 네비 드롭다운의 "사용자 관리"). 최초 admin 계정은 여전히 DB 직접 수정으로 부트스트랩해야 함(그 다음부터는 이 화면으로 관리 가능).
- **제보(밈 제안) → 승인 → 실제 등록 흐름(2026-09-13) 완료** — 누구나 로그인 후 헤더 "제보하기"로 밈 초안(이름/카테고리/한줄설명/출처 링크) 제출([SubmitMemeView](src/pages/SubmitMemeView.jsx)). `GET /submissions/mine`(역할 무관 항상 본인 것만)으로 [MySubmissionsView](src/pages/MySubmissionsView.jsx)에서 내 제보 상태 확인. 에디터/관리자는 `GET /submissions`(전체 큐, 제보자 닉네임 포함)·`PATCH /submissions/:id`(승인/반려)로 [SubmissionQueueView](src/pages/SubmissionQueueView.jsx)에서 처리. 승인만으로 밈이 자동 등록되진 않음(STRATEGY.md 2-6 유지) — 큐에서 "밈으로 등록" 누르면 [RegisterMemeView](src/pages/RegisterMemeView.jsx)(내용 검수용 전체 폼)로 이동해 `POST /memes`로 실제 등록. **제보 없이 바로 등록하는 길도 있음(2026-10-24)** — 계정 메뉴 "밈 등록"(에디터 이상, `/register-meme`), 아카이브용 과거 밈을 에디터가 직접 많이 넣어야 해서 추가. 등록 완료 화면의 "하나 더 등록"은 `setView({name:"registerMeme", ts: Date.now()})`로 App의 key를 바꿔 폼을 리셋함. 같은 제보가 두 번 등록되는 걸 막으려고 `Submission.registeredMemeId`를 두고 밈 생성+연결을 트랜잭션 안 조건부 `updateMany`(원자적 compare-and-swap)로 처리 — 등록되면 큐에 "등록됨 · 보기"로 표시됨.
- **밈 수정/삭제(2026-10-18) 완료** — `PATCH /memes/:id`(에디터 이상, 필드 통째 교체, id는 URL에 쓰여서 수정 불가, 자기 자신은 relatedMemeIds에서 자동 제외)·`DELETE /memes/:id`(관리자 전용). 등록과 수정이 같은 검증을 쓰도록 `memeDataFromBody()`로 공용화(`server/src/routes/memes.js`). 삭제 시 랭킹/인증마크/스크랩/최근 본 기록은 FK Cascade로 같이 지워지고, FK가 아닌 느슨한 참조(다른 밈의 `relatedMemeIds`, 제보의 `registeredMemeId`)는 같은 트랜잭션에서 직접 정리 — 제보는 다시 "밈으로 등록" 가능한 상태로 돌아감(승인 상태는 유지). 프론트는 [RegisterMemeView](src/pages/RegisterMemeView.jsx)가 `editing` prop이 있으면 수정 모드(기존 값으로 채움)로 동작, 경로 `/meme/:id/edit`. [DetailView](src/pages/DetailView.jsx)에 에디터 이상은 "수정", 관리자는 "삭제"(확인창 후 밈 사전으로 이동) 버튼.
- **아카이브 기록·근거 필드(2026-10-24) 완료** — 노션 "데이터 수집 방안" 피드백(과거 밈을 검증된 아카이브로)의 문서 양식을 모델로 옮김. `Meme`에 `grade`(enum `MemeGrade` A/B/C, nullable — "얼마나 퍼졌나", 인증마크의 "근거 확인됐나"와 다른 축), `firstRecord`/`peak`(Json `{date, source|evidence, url?}`), `spreadPath`/`unverified`(String[]), `sourceLinks`(Json `[{title,url}]`) 추가. 날짜는 2000년대 밈이 연/월만 확실한 경우가 많아 `"2007" | "2007.03" | "2007.03.12"` 문자열(서버 `RECORD_DATE_PATTERN`). 전부 선택 — 비우면 null/빈 배열(nullable Json은 `Prisma.DbNull`로 저장). 서버 검증은 `memeDataFromBody()`의 `parseRecord()`. 프론트: `src/data/grades.js`(등급 정의), [GradeBadge](src/components/GradeBadge.jsx)(카드·상세), [RecordSection](src/components/RecordSection.jsx)(상세 "기록과 근거" — 미확인 항목도 숨기지 않고 노출), 등록/수정 폼의 "기록과 근거" 섹션, 밈 사전 등급 필터(A/B/C/미분류). 마이그레이션 `20261024120000_add_archive_record_fields`(컬럼 추가만, 기본값 있음 → **새 코드 배포 전에 먼저 적용**해야 함).
- **인증마크 갱신 UI(2026-09-13) 완료** — `PATCH /memes/:id/verification`(에디터 전용)에 "인증하려면 독립 출처 2개 이상 필요"(STRATEGY.md 2-3) 서버 검증 추가. [DetailView](src/pages/DetailView.jsx)에 에디터/관리자에게만 보이는 [VerificationEditForm](src/components/VerificationEditForm.jsx) 노출(인증 토글/출처 추가삭제/원저작권자/수정 메모) — 저장 시 `refreshMemes()`로 바로 반영.
- `server/` — 백엔드 API(Express). `src/index.js`(엔트리, `/auth`·`/memes`·`/scraps`·`/submissions`·`/users`·`/recently-viewed` 전부 마운트됨), `src/routes/`(auth/memes/scraps/submissions/users/recentlyViewed), `src/middleware/auth.js`(JWT 검증 + role 체크, `requireAuth`/`requireEditor`/`requireAdmin`), `prisma/schema.prisma`(스키마), `prisma/seed.js`(Mock 데이터 이관), `prisma/apply-migration.js`(마이그레이션 SQL을 Neon Pool로 직접 실행하는 재사용 스크립트). 프론트와 완전히 독립된 npm 패키지(모노레포 — 별도 레포 아님).
- **로그인/회원가입 rate limit(2026-09-14)** — `express-rate-limit`으로 IP당 15분/10회 제한(`server/src/routes/auth.js`). Render가 프록시 뒤에 있어서 `app.set("trust proxy", 1)`도 같이 켬(안 그러면 모든 요청이 프록시 IP 하나로 잡힘).

## 디자인 컨벤션
- **2026-09-11부터 "딱딱한 모노톤" 컨벤션(그림자·둥근 모서리 거의 안 씀)을 폐기하고, 상용 웹 서비스에 가까운 방향으로 전면 리디자인함.** 기반은 여전히 중립 톤(흰색/뉴트럴 그레이)이지만 아래 요소로 화려함·입체감을 더함:
  - **브랜드 그라데이션**(보라→핑크→로즈, `src/index.css`의 `.brand-gradient`/`.brand-gradient-text`) — 로고, 주요 CTA 버튼, 활성 탭/네비 밑줄, 1위 랭킹 배지, 섹션 제목 앞 강조바처럼 "포인트"가 필요한 곳에만 씀. 색을 여기저기 남발하면 안 됨 — 이 그라데이션 하나로 통일.
  - **카드**: `rounded-2xl` + 은은한 그림자(`surface-card`/`surface-card-interactive` 유틸리티 클래스, `src/index.css` 참고) + hover 시 살짝 떠오르는 효과(`-translate-y-0.5`).
  - **카테고리 태그**: 카테고리별로 다른 파스텔 배경색(`CategoryTag.jsx`의 `CATEGORY_COLORS` 맵) — 색상 종류는 제한해서 산만해지지 않게 함.
  - **랭킹 등락**: 국내 차트 서비스 관행대로 상승 = 빨강(rose), 하락 = 파랑(blue).
  - **인증마크**: 트렌드 브랜드 컬러(보라/핑크)와 구분되게 에메랄드 톤(신뢰/검증의 의미를 색으로 전달).
  - **네비게이션**: `backdrop-blur` 반투명 흰색(글래스모피즘), sticky.
  - **공용 유틸리티 클래스**(`src/index.css`의 `@layer components`): `.btn-primary`(그라데이션 CTA), `.btn-secondary`, `.btn-ghost`, `.input-field`, `.pill`, `.surface-card`, `.surface-card-interactive` — 새 UI 짤 때 최대한 이거 재사용할 것. Tailwind v4에서는 `@apply`로 커스텀 클래스(`brand-gradient` 등)를 또 다른 커스텀 클래스 안에 넣을 수 없음(실제 Tailwind 유틸리티만 `@apply` 가능) — 그라데이션이 필요하면 `background-image`를 일반 CSS로 직접 쓰거나 클래스를 나란히 붙일 것.
  - 화려해졌어도 "정신없지 않게" — 그라데이션은 브랜드 컬러 하나로 제한, 카테고리 색은 옅은 파스텔 톤만, 애니메이션은 전부 150~200ms 이내의 미세한 transition/hover 효과로 제한(과한 모션 없음).
- 폰트는 Noto Sans KR. `font-serif-kr` 클래스는 이름과 달리 실제로는 Noto Sans KR bold(굵은 고딕)를 적용함 — serif 폰트가 아니니 이름에 헷갈리지 말 것.
- 실제 통계·인물·영상 데이터가 아닌 섹션에는 `<MockTag />`로 "Mock Data" 표시를 붙임(이제 amber 톤 pill 스타일)

## 데이터
- 밈 데이터는 이제 백엔드 DB(`memes` 테이블)가 정본 — 프론트는 앱 로드 시 `GET /memes`로 한 번 fetch해서 전역 상태(`useAppState`의 `memes`)로 들고 있고, `memeById`도 그 배열에서 찾는 파생 함수임. `src/data/memes.js`의 `MEMES`/`memeById`는 이제 프론트가 안 쓰고 `server/prisma/seed.js`(DB 재시드용) 전용으로만 남아있음 — 지우면 안 됨.
- 각 밈에 `verification` 필드(`{ verified, sources, copyrightHolder?, reviewedBy?, reviewedAt?, changeLog }`)가 있음 — STRATEGY.md 2-3에서 정한 인증마크 체크리스트를 담음. `<VerificationBadge />`/`<VerificationSection />`이 이 필드를 읽어서 표시.
- 아카이브 등급·기록 필드(`grade`/`firstRecord`/`peak`/`spreadPath`/`sourceLinks`/`unverified`)는 2026-10-24 기준 전부 비어 있음 — 과거 밈 후보 조사(노션 "데이터 수집 방안" 2단계)에서 채울 예정. 연도별 아카이브 화면은 아직 `timeline`의 `date` 문자열로 연/월을 매칭함(`firstRecord`로 바꾸는 건 데이터가 채워진 뒤).
- 랭킹은 `period`(daily/weekly/monthly/yearly)별로 `rank` 필드에 미리 정의됨. "직접 설정" 기간은 문자열 해시 기반 결정론적 의사난수로 즉석 생성(`customRankList`) — 실제 데이터 아님.

## 작업 시 참고
- 새 세션 시작 시 [docs/PROGRESS.md](docs/PROGRESS.md)도 함께 확인해서 진행 상황을 이어갈 것.
- [docs/SPEC.md](docs/SPEC.md)에 이 프로젝트의 원본 기획서(초기 제작 프롬프트) 전문이 보존되어 있음. 기능/디자인 방향에 대해 판단이 필요할 때 참고할 것. 단, TypeScript 관련 항목(18번)처럼 의도적으로 벗어난 부분도 있으니 SPEC.md 상단의 "알려진 의도적 이탈 사항"을 먼저 확인할 것.
- [docs/STRATEGY.md](docs/STRATEGY.md)에 "이 기획이 실제로 경쟁력이 있는가"를 스스로 반박·보완해나간 기획 피드백 토론 기록이 있음. 차별화 전략, 인증마크(신뢰도) 설계, 수익모델 등을 다룰 때 먼저 확인할 것. 모든 스레드(2-1~2-8) 닫힘 — 기획 단계는 확정·마무리됨.
- [docs/BACKEND.md](docs/BACKEND.md)에 실제 배포를 위한 백엔드 아키텍처 결정(Node/Express + Neon Postgres + Prisma + httpOnly 쿠키 JWT, 모노레포 구조, 데이터 모델·API 엔드포인트 초안)이 정리돼 있음. 백엔드 관련 작업 시작 전 먼저 확인할 것.
