# 유행도감 (Trend Encyclopedia)

요즘 유행하는 밈·유행어·상품·인물·챌린지를 검색하고 둘러볼 수 있는 React 웹앱. 프로토타입 단계에서 실제 배포 단계로 전환 중 — 로그인/회원가입, 밈 데이터 조회, 스크랩, 최근 본 밈, 사용자 역할 관리, 제보(밈 제안)와 승인된 제보의 실제 밈 등록, 인증마크 갱신까지 전부 실제 백엔드에 연동되고 curl로 실동작 확인 완료. 실제 URL 라우팅(`history.pushState`)도 구현 완료. **배포는 진행 중** — 백엔드는 Render에 떠 있음(`https://trend-book.onrender.com`), 프론트(Vercel)는 계정 2FA 설정에서 중단(다음 세션에 이어갈 것, [docs/PROGRESS.md](docs/PROGRESS.md) 참고). 실제 트렌드 애널리틱스는 아직임.

## 기술 스택
- 프론트: React 19 + Vite, Tailwind CSS 4 (`@tailwindcss/vite` 플러그인), lucide-react(아이콘), oxlint(린트, TypeScript 아님 — 순수 JSX)
- 백엔드(`server/`, 2026-09-11 추가, 구현 진행 중): Node + Express, Prisma(ORM), Neon(PostgreSQL 호스팅) — 단, 이 PC방 네트워크가 표준 Postgres 포트(5432)를 막아놔서 `@prisma/adapter-neon` + `@neondatabase/serverless`로 HTTP/WebSocket(443) 기반 접속을 씀. 인증은 bcryptjs + jsonwebtoken(httpOnly 쿠키). 결정 배경은 [docs/BACKEND.md](docs/BACKEND.md) 참고.

## 실행 명령어
프론트(레포 루트에서):
- `npm run dev` — 개발 서버
- `npm run build` — 프로덕션 빌드
- `npm run lint` — oxlint 실행
- `npm run preview` — 빌드 결과 미리보기

백엔드(`server/` 디렉토리에서, **npm run 대신 항상 아래처럼 직접 실행** — 이유는 아래 "PC방 컴퓨터" 항목 참고):
- `node src/index.js` — API 서버 실행 (기본 포트 4000)
- `node node_modules/prisma/build/index.js generate` — Prisma Client 생성 (스키마만 읽음, DB 연결 불필요). **서버(`node src/index.js`)가 이미 떠 있는 상태에서 실행하면 엔진 파일이 잠겨서 `EPERM: rename ... query_engine-windows.dll.node` 에러가 남** — 먼저 그 서버 프로세스를 종료(`tasklist`/`taskkill //F //PID <pid>`)하고 다시 실행할 것.
- `node prisma/seed.js` — 기존 Mock 데이터(`src/data/memes.js`)를 DB로 이관하는 시드 스크립트
- 최초 실행 전 `server/.env.example`을 `server/.env`로 복사하고 값 채울 것 (git에 안 잡힘 — PC 바뀔 때마다 새로 만들어야 함)
- **`prisma migrate dev`/`deploy`는 이 네트워크(5432 포트 차단)에서 안 됨** — 마이그레이션 엔진이 어댑터를 안 타고 자체적으로 TCP 접속을 시도하기 때문. 스키마를 바꿨으면 대신:
  1. **최초 스키마(테이블이 하나도 없는 상태)일 때만** `--from-empty` 사용: `node node_modules/prisma/build/index.js migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script`. **이미 테이블이 있는 상태에서 스키마를 추가/변경할 때는 `--from-empty` 쓰면 안 됨** — 기존 테이블까지 처음부터 다시 `CREATE TABLE`하는 SQL이 나와서 이미 있는 테이블과 충돌함(2026-09-12 발견).
     증분 SQL 생성 시 `--from-migrations prisma/migrations --to-schema-datamodel prisma/schema.prisma --script`를 쓰고 싶어지는데, **이건 실제로 안 됨(2026-09-13 발견)** — `--from-migrations`/`--to-migrations`는 내부적으로 마이그레이션 히스토리를 재생해볼 shadow database가 필요해서 `--shadow-database-url`을 요구하고, 이것도 결국 5432 TCP 접속이라 이 네트워크에선 못 씀. **대신**: 현재 라이브 DB 상태를 반영하는 "변경 전" 스키마 스냅샷을 임시 파일로 만들어서(즉, `prisma/schema.prisma`에서 이번에 추가/변경한 모델·필드만 빼거나 되돌린 사본) `--from-schema-datamodel <임시 파일 경로> --to-schema-datamodel prisma/schema.prisma --script`로 두 스키마 파일끼리 비교할 것 — 이 조합은 정적 파일 비교라 DB/shadow db가 전혀 필요 없음(완전 오프라인).
  2. 그 SQL을 `server/prisma/apply-migration.js`로 직접 실행 (443 포트, `@neondatabase/serverless`의 `Pool` 사용) — `node prisma/apply-migration.js prisma/migrations/<타임스탬프>_<이름>/migration.sql`. 새 마이그레이션 폴더를 만들 때 타임스탬프는 기존 폴더명(`YYYYMMDDHHMMSS_설명`)과 같은 형식으로 맞출 것.
  - `prisma/migrations/migration_lock.toml`(provider만 적힌 한 줄짜리 파일)이 없으면 `migrate diff`류 명령이 "missing migration_lock.toml" 에러를 냄 — 지금까지 마이그레이션을 전부 `prisma migrate dev`가 아니라 위 방식(수동 SQL 적용)으로만 해와서 이 파일이 애초에 생성된 적이 없었음(2026-09-13 발견). 내용은 `provider = "postgresql"` 한 줄이면 됨, DB 연결 없이 그냥 만들면 됨.
  3. `_prisma_migrations` 이력 테이블엔 안 남으므로, 5432가 뚫리는 네트워크(집 등)에서 작업할 기회가 있으면 그때 `prisma migrate resolve --applied <migration명>`으로 한 번 동기화해줄 것.

## 현재 아키텍처
- [src/App.jsx](src/App.jsx)는 얇은 셸(shell)만 담당 — `useAppState` 훅으로 상태를 받아 NavBar와 현재 view에 맞는 페이지를 렌더링.
- `src/data/memes.js` — `CATEGORIES`(프론트가 여전히 정적 import로 씀, 고정 taxonomy라 DB 이관 대상 아님)와 `MEMES`/`memeById`(더 이상 프론트가 안 씀 — `server/prisma/seed.js`가 DB 시드용으로만 import함. 지우면 안 됨, 재시드할 방법이 없어짐). `src/data/rank.js`는 `memes` 배열을 인자로 받는 순수 함수(`rankList`/`unifiedRankList`)로 바뀜 — 더 이상 MEMES를 직접 import 안 함.
- `src/lib/api.js` — 백엔드(`server/`) API 호출용 fetch 래퍼. `credentials: "include"` 필수(httpOnly 쿠키 인증). `VITE_API_URL` 환경변수로 백엔드 주소 지정(루트 `.env`, `.env.example` 참고). `getMemes`/`createMeme`/`getScraps`/`addScrap`/`removeScrap`/`getRecentlyViewed`/`recordRecentlyViewed`/`getUsers`/`updateUserRole`/`createSubmission`/`getMySubmissions`/`getSubmissionQueue`/`updateSubmissionStatus`/`updateVerification` 등 보유. `normalizeMeme()`가 서버 응답 모양(평탄화된 buzz/search/usage/trend, ranks 배열)을 프론트가 쓰는 형태(`popularity` 객체, `rank`가 기간별 키 객체)로 맞춰줌 — 밈 관련 API를 새로 추가할 때 이 정규화 패턴을 재사용할 것.
- `src/hooks/useAppState.js` — view/user/memes/scraps/recentlyViewed 상태 관리. `memes`는 앱 로드 시 `GET /memes`로 한 번 fetch(`memeById`는 이 배열에서 찾는 파생 함수, `refreshMemes`는 밈 등록 직후처럼 새로고침 없이 목록을 다시 받아와야 할 때 씀). `scraps`·`recentlyViewed` 둘 다 로그인 상태일 때만 서버에서 채워지고 서버가 정본(비로그인이면 아예 추적 안 함 — 로그인 화면으로 유도, 마이페이지가 어차피 로그인 필수라 도달 불가능한 경우라 단순화). `localStorage`는 이제 이 앱에서 전혀 안 씀(`src/lib/storage.js`도 삭제됨). `user`도 localStorage에 안 남기고 앱 로드 시 `GET /auth/me`로 채움.
- `src/components/` — 여러 페이지에서 재사용되는 작은 UI 조각(Logo, NavBar, SearchBar, MemeCard, CategoryTag, MockTag, RankChange, MetricBar, Sparkline, SectionHeading, PillTabs, VerificationBadge, VerificationEditForm, SubmissionCard, SubmissionStatusBadge 등)
- `src/pages/` — 화면 단위 뷰 컴포넌트 (HomeView, SearchResultsView, DetailView, TrendView, DictionaryView, ArchiveView, AuthView, MyPageView, ScrapsView, EditProfileView, AdminUsersView, SubmitMemeView, MySubmissionsView, SubmissionQueueView, RegisterMemeView)
- 라우팅 라이브러리 없이 `view` state 객체(`{ name: "home" | "search" | "detail" | "trend" | "dictionary" | "archive" | "auth" | "mypage" | "scraps" | "admin" | "submit" | "mySubmissions" | "submissionQueue" | "registerMeme", ...params }`)로 화면 전환. 브라우저 뒤로가기/URL 공유는 동작하지 않음 — 다음 작업 예정([docs/PROGRESS.md](docs/PROGRESS.md) 참고).
- **로그인/회원가입은 2026-09-11부터 실제 백엔드(`server/`)에 연동됨** — `src/lib/api.js`가 `/auth/*` API를 호출하고, 세션은 서버가 발급하는 httpOnly 쿠키로 관리(`useAppState`가 앱 로드 시 `GET /auth/me`로 로그인 여부 확인). 더 이상 Mock 아님. **로그인은 이메일이 아니라 아이디(username) 기준**이고, 회원가입 시 닉네임/이메일/아이디/실명/생년월일/휴대전화번호를 전부 입력받음(`src/pages/AuthView.jsx`). 마이페이지에서 "내 정보 수정"(`src/pages/EditProfileView.jsx`)으로 닉네임/이메일/실명/휴대전화번호 수정 가능 — 아이디·생년월일은 불변.
- **밈 데이터(2026-09-12)와 스크랩(2026-09-12)은 실제 백엔드 API로 연동 완료.** 밈 데이터는 `GET /memes`(목록), 스크랩은 로그인 필요 `GET/POST/DELETE /scraps`.
- **최근 본 밈(2026-09-13)** — `GET/POST /recently-viewed`(로그인 필요, 최근 5개, `(userId,memeId)` upsert로 중복 없이 viewedAt만 갱신), `useAppState`가 스크랩과 동일 패턴으로 처리. DB 마이그레이션 적용 + curl로 인증 가드/기록/정렬/5개 제한까지 실동작 확인 완료.
- **사용자 역할 관리(2026-09-12) 추가** — admin 계정이 `GET /users`(목록)·`PATCH /users/:id/role`(역할 변경)로 다른 유저를 editor/admin으로 승격 가능. 프론트는 [AdminUsersView](src/pages/AdminUsersView.jsx)(관리자만 접근, 네비 드롭다운의 "사용자 관리"). 최초 admin 계정은 여전히 DB 직접 수정으로 부트스트랩해야 함(그 다음부터는 이 화면으로 관리 가능).
- **제보(밈 제안) → 승인 → 실제 등록 흐름(2026-09-13) 완료** — 누구나 로그인 후 헤더 "제보하기"로 밈 초안(이름/카테고리/한줄설명/출처 링크) 제출([SubmitMemeView](src/pages/SubmitMemeView.jsx)). `GET /submissions/mine`(역할 무관 항상 본인 것만)으로 [MySubmissionsView](src/pages/MySubmissionsView.jsx)에서 내 제보 상태 확인. 에디터/관리자는 `GET /submissions`(전체 큐, 제보자 닉네임 포함)·`PATCH /submissions/:id`(승인/반려)로 [SubmissionQueueView](src/pages/SubmissionQueueView.jsx)에서 처리. 승인만으로 밈이 자동 등록되진 않음(STRATEGY.md 2-6 유지) — 큐에서 "밈으로 등록" 누르면 [RegisterMemeView](src/pages/RegisterMemeView.jsx)(내용 검수용 전체 폼)로 이동해 `POST /memes`로 실제 등록. 같은 제보가 두 번 등록되는 걸 막으려고 `Submission.registeredMemeId`를 두고 밈 생성+연결을 트랜잭션 안 조건부 `updateMany`(원자적 compare-and-swap)로 처리 — 등록되면 큐에 "등록됨 · 보기"로 표시됨.
- **인증마크 갱신 UI(2026-09-13) 완료** — `PATCH /memes/:id/verification`(에디터 전용)에 "인증하려면 독립 출처 2개 이상 필요"(STRATEGY.md 2-3) 서버 검증 추가. [DetailView](src/pages/DetailView.jsx)에 에디터/관리자에게만 보이는 [VerificationEditForm](src/components/VerificationEditForm.jsx) 노출(인증 토글/출처 추가삭제/원저작권자/수정 메모) — 저장 시 `refreshMemes()`로 바로 반영.
- `server/` — 백엔드 API(Express). `src/index.js`(엔트리, `/auth`·`/memes`·`/scraps`·`/submissions`·`/users`·`/recently-viewed` 전부 마운트됨), `src/routes/`(auth/memes/scraps/submissions/users/recentlyViewed), `src/middleware/auth.js`(JWT 검증 + role 체크, `requireAuth`/`requireEditor`/`requireAdmin`), `prisma/schema.prisma`(스키마), `prisma/seed.js`(Mock 데이터 이관), `prisma/apply-migration.js`(마이그레이션 SQL을 Neon Pool로 직접 실행하는 재사용 스크립트). 프론트와 완전히 독립된 npm 패키지(모노레포 — 별도 레포 아님).

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
- 랭킹은 `period`(daily/weekly/monthly/yearly)별로 `rank` 필드에 미리 정의됨. "직접 설정" 기간은 문자열 해시 기반 결정론적 의사난수로 즉석 생성(`customRankList`) — 실제 데이터 아님.

## 작업 시 참고
- 새 세션 시작 시 [docs/PROGRESS.md](docs/PROGRESS.md)도 함께 확인해서 진행 상황을 이어갈 것.
- [docs/SPEC.md](docs/SPEC.md)에 이 프로젝트의 원본 기획서(초기 제작 프롬프트) 전문이 보존되어 있음. 기능/디자인 방향에 대해 판단이 필요할 때 참고할 것. 단, TypeScript 관련 항목(18번)처럼 의도적으로 벗어난 부분도 있으니 SPEC.md 상단의 "알려진 의도적 이탈 사항"을 먼저 확인할 것.
- [docs/STRATEGY.md](docs/STRATEGY.md)에 "이 기획이 실제로 경쟁력이 있는가"를 스스로 반박·보완해나간 기획 피드백 토론 기록이 있음. 차별화 전략, 인증마크(신뢰도) 설계, 수익모델 등을 다룰 때 먼저 확인할 것. 모든 스레드(2-1~2-8) 닫힘 — 기획 단계는 확정·마무리됨.
- [docs/BACKEND.md](docs/BACKEND.md)에 실제 배포를 위한 백엔드 아키텍처 결정(Node/Express + Neon Postgres + Prisma + httpOnly 쿠키 JWT, 모노레포 구조, 데이터 모델·API 엔드포인트 초안)이 정리돼 있음. 백엔드 관련 작업 시작 전 먼저 확인할 것.
- 이 프로젝트는 PC방 등 여러 컴퓨터를 오가며 작업함 — 세션 종료 전 항상 git commit + push, 시작 시 git pull.
- **환경 점검은 "정말 필요한 것만" 하고 검증용 절차를 늘리지 말 것(2026-09-14 피드백: 매번 시간 너무 오래 걸림).** 이 프로젝트는 실제로 매번 다른 PC(PC방)라 `node_modules`/`.env`가 없는 게 정상이고 설치 자체는 매번 새로 해야 함 — 그건 못 줄임. 대신 아래 두 가지는 **항상 하지 말고, 실제로 문제가 생겼을 때만(반응적으로)** 할 것:
  - **손상 체크(lucide-react 파일 개수, `@tailwindcss/oxide` 네이티브 바이너리 등)를 설치 끝날 때마다 미리 해보지 말 것.** 이건 가끔 생기는 문제지 매번 생기는 게 아님 — `npm install`이 끝나면 바로 build/lint 한 번만 돌려보고, 거기서 진짜로 이상한 모듈 해석 에러가 나올 때만 그때 가서 해당 패키지를 의심하고 재설치할 것.
  - **dev 서버·백엔드 서버를 띄워서 curl로 확인하고 다시 끄는 절차를 환경 점검에 기본으로 넣지 말 것.** build 성공 + lint 클린이면 환경 자체는 검증된 것 — 서버를 실제로 띄워서 보여주는 건 사용자가 그걸 원할 때(직접 보고 싶다거나 실행해달라고 할 때)만 별도로 할 것.
  결국 환경 점검의 기본 흐름은: node 확인 → git identity 확인/수정 → `.env` 없으면 템플릿에서 생성 → `npm install`(서버는 `--ignore-scripts`) → `prisma generate` → Vite `net use` 패치 적용(이건 이 네트워크에서 100% 재현되는 문제라 예방적으로 바로 할 것) → build/lint 한 번. 여기서 끝 — 추가 검증은 안 함.
- **PC마다 node.js가 아예 설치되어 있지 않을 수 있음** (PC방 컴퓨터가 특히 그럼). PATH 문제가 아니라 진짜 미설치인지 먼저 확인할 것(`node -v`). 설치돼 있어도 방금 설치했다면 VS Code(정확히는 Claude Code 확장을 호스팅하는 프로세스)를 재시작해야 새 PATH가 반영됨 — 재시작 전에는 설치했는데도 `command not found`가 뜰 수 있음.
- **진짜 새 PC는 git 사용자 정보(`user.name`/`user.email`)도 아예 설정 안 돼 있어서 첫 커밋 시도에서 "Author identity unknown" 에러가 남(2026-09-13 확인).** `git log --format='%an <%ae>'`로 기존 커밋 작성자를 확인해서 `git config user.name "109kim"` / `git config user.email "27174298leo@gmail.com"`로 (레포 로컬에만, `--global` 없이) 맞춰줄 것.
- **이 PC방 컴퓨터는 `cmd.exe`/`powershell.exe` 프로세스 스폰 자체를 정책상 막아놓음 — Claude 도구뿐 아니라 사용자가 직접 여는 git bash에서도 재현됨(확인됨: 2026-09-10).** `npm run dev`/`npm run build`/`npm run lint`는 Windows에서 npm이 내부적으로 `cmd.exe /d /s /c "..."`로 스크립트를 실행하는데, 이 스폰이 막히면서 `> vite` 같은 배너 줄만 찍히고 그 이후 아무 반응 없이 조용히 멈춘다(사용자 bash에서도, Claude의 Bash 도구에서도 동일 증상: 에러 메시지 없이 그냥 멈추거나 exit 127).
  - **따라서 `npm run <script>` 대신 항상 실제 바이너리를 직접 호출할 것** — 이건 Claude 자신이 검증할 때뿐 아니라 사용자에게 실행을 안내할 때도 마찬가지임:
    - 개발 서버: `node node_modules/vite/bin/vite.js`
    - 빌드: `node node_modules/vite/bin/vite.js build`
    - 린트: `node_modules/oxlint/bin/oxlint` (`.bin`의 `.cmd`/`.ps1` shim이 아니라 실제 바이너리 경로)
  - `child_process.exec`/`execSync`처럼 내부적으로 cmd.exe를 거치는 호출만 막히고, `execFile`/`spawn`으로 바이너리를 직접 실행하는 건 정상 동작함(node.exe, bash.exe, git.exe 등). `npm install` 자체는 이 프론트엔드 의존성(vite, tailwind, oxlint, lucide-react 등 — install/postinstall 스크립트 없음)에 한해서는 cmd.exe를 안 거치므로 문제없이 된다.
  - **단, `npm install`도 무조건 안전한 건 아님(2026-09-11, `server/` 추가하면서 확인)** — 설치하려는 패키지 중 `postinstall` 등 라이프사이클 스크립트가 있는 경우(예: `prisma`), npm이 그 스크립트를 실행하려고 내부적으로 cmd.exe를 스폰하면서 똑같이 막힘 → `npm error errno: -4048, code: 'EPERM', syscall: 'spawn'`로 설치 자체가 실패한다. 대응: `npm install --ignore-scripts`로 라이프사이클 스크립트를 건너뛰고 설치한 뒤, 필요한 스크립트(예: `prisma generate`)는 `node node_modules/prisma/build/index.js generate`처럼 실제 바이너리를 직접 호출해서 수동으로 실행할 것. `npx <cli>`도 내부적으로 같은 방식이라 막힐 수 있으니 `npx` 대신 항상 `node node_modules/<pkg>/<entry>` 직접 호출 패턴을 우선 시도할 것.
  - Vite 8.2.2는 추가로 Windows 설정 로딩 시 내부적으로 `exec("net use")`를 호출(`node_modules/vite/dist/node/chunks/node.js`의 `optimizeSafeRealPathSync`)하는데 이것도 cmd.exe라서 막힌다. 이번엔 콜백에 에러가 전달되는 게 아니라 `exec()` 호출 자체가 동기적으로 `spawn EPERM`을 던지는 걸로 확인됨(2026-09-13) — 그 `exec(...)` 호출을 `try { ... } catch { safeRealpathSync = fs.realpathSync.native; }`로 감싸면 우회되지만(네트워크 드라이브 판별만 건너뜀, 로컬 드라이브엔 영향 없음), `node_modules`는 git에 안 잡히므로 `npm install`을 다시 하면 사라지는 임시 조치임 — 필요할 때마다 다시 적용.
  - **이 네트워크는 `npm install` 자체가 성공(exit 0)해도 일부 패키지 파일이 손상되거나 누락된 채로 받아질 수 있음(2026-09-13 발견, 원인은 불명 — 아마 네트워크 불안정으로 인한 부분 다운로드).** 이번 세션에서 실제로 두 번 재현됨: (1) `@tailwindcss/oxide-win32-x64-msvc`의 네이티브 바이너리(`.node` 파일)가 손상됨("stream did not contain valid UTF-8" 에러로 나타남), (2) `lucide-react`가 아이콘 파일 대부분이 빠진 채 설치됨(1155개만 있어야 할 4000개대 파일 중 `index.mjs`를 포함한 다수가 없어서 빌드 시 `[UNRESOLVED_IMPORT]` 에러). `npm install`이 에러 없이 끝났다고 안심하지 말고, 빌드/린트가 이상한 모듈 해석 에러를 내면 먼저 해당 패키지(또는 전체 `node_modules` + `package-lock.json`)를 지우고 재설치해볼 것 — 재설치로 두 번 다 해결됨.
- **이 PC방 컴퓨터(같은 네트워크)는 추가로 Postgres 기본 포트(5432) 아웃바운드 자체를 막아놓음(확인됨: 2026-09-11).** 443(HTTPS)은 정상 연결됨. 그래서 `DATABASE_URL`이 정확해도 `prisma migrate`/일반 TCP 기반 Postgres 클라이언트는 전부 `P1001: Can't reach database server`로 타임아웃남 — Neon 프로젝트나 연결 문자열 문제가 아니라 네트워크 정책 문제였음. 대응: 서버(`server/`)는 표준 TCP 대신 **Neon의 HTTP/WebSocket 기반 드라이버(`@neondatabase/serverless` + `@prisma/adapter-neon`)로 접속**하도록 만들어둠 — 이건 443 포트만 쓰므로 이 네트워크에서도 정상 동작함(자세한 내용과 마이그레이션 적용 방법은 [docs/BACKEND.md](docs/BACKEND.md) 참고). 다른(제약 없는) 네트워크에서 작업할 땐 이 어댑터가 오히려 불필요할 수도 있지만, 굳이 걷어낼 필요는 없음 — 어차피 정상 동작함.
