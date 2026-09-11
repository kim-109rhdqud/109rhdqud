# 유행도감 (Trend Encyclopedia)

요즘 유행하는 밈·유행어·상품·인물·챌린지를 검색하고 둘러볼 수 있는 React 웹앱. 프로토타입 단계에서 실제 배포 단계로 전환 중 — 로그인/회원가입은 실제 백엔드에 연동됐지만, 밈 데이터 자체와 스크랩/최근 본 밈은 아직 Mock/localStorage임(아래 "현재 아키텍처" 참고).

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
  1. `node node_modules/prisma/build/index.js migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script` (DB 연결 없이 SQL만 생성)
  2. 그 SQL을 `@neondatabase/serverless`의 `Pool`로 직접 실행 (443 포트, docs/BACKEND.md에 실제 사용한 스크립트 예시 있음)
  3. `_prisma_migrations` 이력 테이블엔 안 남으므로, 5432가 뚫리는 네트워크(집 등)에서 작업할 기회가 있으면 그때 `prisma migrate resolve --applied <migration명>`으로 한 번 동기화해줄 것.

## 현재 아키텍처
- [src/App.jsx](src/App.jsx)는 얇은 셸(shell)만 담당 — `useAppState` 훅으로 상태를 받아 NavBar와 현재 view에 맞는 페이지를 렌더링.
- `src/data/` — `memes.js`(MEMES, CATEGORIES, memeById), `rank.js`(기간별 랭킹 계산)
- `src/lib/storage.js` — localStorage 안전 read/write 래퍼
- `src/lib/api.js` — 백엔드(`server/`) API 호출용 fetch 래퍼. `credentials: "include"` 필수(httpOnly 쿠키 인증). `VITE_API_URL` 환경변수로 백엔드 주소 지정(루트 `.env`, `.env.example` 참고)
- `src/hooks/useAppState.js` — view/user/scraps/recentlyViewed 상태 관리. `scraps`/`recentlyViewed`만 localStorage에 영속화되고, `user`는 더 이상 localStorage에 안 남김 — 앱 로드 시 `GET /auth/me`로 서버 세션을 확인해서 채움.
- `src/components/` — 여러 페이지에서 재사용되는 작은 UI 조각(Logo, NavBar, SearchBar, MemeCard, CategoryTag, MockTag, RankChange, MetricBar, Sparkline, SectionHeading, PillTabs, VerificationBadge 등)
- `src/pages/` — 화면 단위 뷰 컴포넌트 (HomeView, SearchResultsView, DetailView, TrendView, DictionaryView, ArchiveView, AuthView, MyPageView, ScrapsView, EditProfileView)
- 라우팅 라이브러리 없이 `view` state 객체(`{ name: "home" | "search" | "detail" | "trend" | "dictionary" | "archive" | "auth" | "mypage" | "scraps", ...params }`)로 화면 전환. 브라우저 뒤로가기/URL 공유는 동작하지 않음.
- **로그인/회원가입은 2026-09-11부터 실제 백엔드(`server/`)에 연동됨** — `src/lib/api.js`가 `/auth/*` API를 호출하고, 세션은 서버가 발급하는 httpOnly 쿠키로 관리(`useAppState`가 앱 로드 시 `GET /auth/me`로 로그인 여부 확인). 더 이상 Mock 아님. **로그인은 이메일이 아니라 아이디(username) 기준**이고, 회원가입 시 닉네임/이메일/아이디/실명/생년월일/휴대전화번호를 전부 입력받음(`src/pages/AuthView.jsx`). 마이페이지에서 "내 정보 수정"(`src/pages/EditProfileView.jsx`)으로 닉네임/이메일/실명/휴대전화번호 수정 가능 — 아이디·생년월일은 불변.
- 스크랩(찜)과 최근 본 밈은 아직 `localStorage`에 영속화됨(새로고침해도 유지, 기기 간 동기화는 안 됨) — 밈 데이터 자체도 아직 `src/data/memes.js` 정적 import로 읽는 중. 둘 다 백엔드 API로 옮기는 작업이 남아있음 — [docs/BACKEND.md](docs/BACKEND.md) "다음에 구현할 순서" 참고.
- `server/` — 백엔드 API(Express). `src/index.js`(엔트리), `src/routes/`(auth/memes/scraps/submissions), `src/middleware/auth.js`(JWT 검증 + role 체크), `prisma/schema.prisma`(스키마), `prisma/seed.js`(Mock 데이터 이관). 프론트와 완전히 독립된 npm 패키지(모노레포 — 별도 레포 아님).

## 디자인 컨벤션
- 흑백 모노톤, 얇은 border 기반 카드 UI (그림자·둥근 모서리 거의 안 씀)
- 폰트는 Noto Sans KR. `font-serif-kr` 클래스는 이름과 달리 실제로는 Noto Sans KR bold(굵은 고딕)를 적용함 — serif 폰트가 아니니 이름에 헷갈리지 말 것.
- 실제 통계·인물·영상 데이터가 아닌 섹션에는 `<MockTag />`로 "Mock Data" 표시를 붙임

## 데이터
- `MEMES` 배열이 프론트의 유일한 데이터 소스 (`src/data/memes.js`, `memeById`로 조회). 프론트는 아직 이걸 정적 import로 읽음 — 백엔드 `/memes` API로 교체하는 작업이 남아있음([docs/BACKEND.md](docs/BACKEND.md) 참고). 같은 데이터가 `server/prisma/seed.js`를 통해 실제 DB(`memes` 테이블)에도 이관돼 있지만, 프론트가 아직 그걸 안 씀 — 두 군데를 동시에 손대야 할 상황이면 주의.
- 각 밈에 `verification` 필드(`{ verified, sources, copyrightHolder?, reviewedBy?, reviewedAt?, changeLog }`)가 있음 — STRATEGY.md 2-3에서 정한 인증마크 체크리스트를 담음. `<VerificationBadge />`/`<VerificationSection />`이 이 필드를 읽어서 표시.
- 랭킹은 `period`(daily/weekly/monthly/yearly)별로 `rank` 필드에 미리 정의됨. "직접 설정" 기간은 문자열 해시 기반 결정론적 의사난수로 즉석 생성(`customRankList`) — 실제 데이터 아님.

## 작업 시 참고
- 새 세션 시작 시 [docs/PROGRESS.md](docs/PROGRESS.md)도 함께 확인해서 진행 상황을 이어갈 것.
- [docs/SPEC.md](docs/SPEC.md)에 이 프로젝트의 원본 기획서(초기 제작 프롬프트) 전문이 보존되어 있음. 기능/디자인 방향에 대해 판단이 필요할 때 참고할 것. 단, TypeScript 관련 항목(18번)처럼 의도적으로 벗어난 부분도 있으니 SPEC.md 상단의 "알려진 의도적 이탈 사항"을 먼저 확인할 것.
- [docs/STRATEGY.md](docs/STRATEGY.md)에 "이 기획이 실제로 경쟁력이 있는가"를 스스로 반박·보완해나간 기획 피드백 토론 기록이 있음. 차별화 전략, 인증마크(신뢰도) 설계, 수익모델 등을 다룰 때 먼저 확인할 것. 모든 스레드(2-1~2-8) 닫힘 — 기획 단계는 확정·마무리됨.
- [docs/BACKEND.md](docs/BACKEND.md)에 실제 배포를 위한 백엔드 아키텍처 결정(Node/Express + Neon Postgres + Prisma + httpOnly 쿠키 JWT, 모노레포 구조, 데이터 모델·API 엔드포인트 초안)이 정리돼 있음. 백엔드 관련 작업 시작 전 먼저 확인할 것.
- 이 프로젝트는 PC방 등 여러 컴퓨터를 오가며 작업함 — 세션 종료 전 항상 git commit + push, 시작 시 git pull.
- **PC마다 node.js가 아예 설치되어 있지 않을 수 있음** (PC방 컴퓨터가 특히 그럼). PATH 문제가 아니라 진짜 미설치인지 먼저 확인할 것(`node -v`). 설치돼 있어도 방금 설치했다면 VS Code(정확히는 Claude Code 확장을 호스팅하는 프로세스)를 재시작해야 새 PATH가 반영됨 — 재시작 전에는 설치했는데도 `command not found`가 뜰 수 있음.
- **이 PC방 컴퓨터는 `cmd.exe`/`powershell.exe` 프로세스 스폰 자체를 정책상 막아놓음 — Claude 도구뿐 아니라 사용자가 직접 여는 git bash에서도 재현됨(확인됨: 2026-09-10).** `npm run dev`/`npm run build`/`npm run lint`는 Windows에서 npm이 내부적으로 `cmd.exe /d /s /c "..."`로 스크립트를 실행하는데, 이 스폰이 막히면서 `> vite` 같은 배너 줄만 찍히고 그 이후 아무 반응 없이 조용히 멈춘다(사용자 bash에서도, Claude의 Bash 도구에서도 동일 증상: 에러 메시지 없이 그냥 멈추거나 exit 127).
  - **따라서 `npm run <script>` 대신 항상 실제 바이너리를 직접 호출할 것** — 이건 Claude 자신이 검증할 때뿐 아니라 사용자에게 실행을 안내할 때도 마찬가지임:
    - 개발 서버: `node node_modules/vite/bin/vite.js`
    - 빌드: `node node_modules/vite/bin/vite.js build`
    - 린트: `node_modules/oxlint/bin/oxlint` (`.bin`의 `.cmd`/`.ps1` shim이 아니라 실제 바이너리 경로)
  - `child_process.exec`/`execSync`처럼 내부적으로 cmd.exe를 거치는 호출만 막히고, `execFile`/`spawn`으로 바이너리를 직접 실행하는 건 정상 동작함(node.exe, bash.exe, git.exe 등). `npm install` 자체는 이 프론트엔드 의존성(vite, tailwind, oxlint, lucide-react 등 — install/postinstall 스크립트 없음)에 한해서는 cmd.exe를 안 거치므로 문제없이 된다.
  - **단, `npm install`도 무조건 안전한 건 아님(2026-09-11, `server/` 추가하면서 확인)** — 설치하려는 패키지 중 `postinstall` 등 라이프사이클 스크립트가 있는 경우(예: `prisma`), npm이 그 스크립트를 실행하려고 내부적으로 cmd.exe를 스폰하면서 똑같이 막힘 → `npm error errno: -4048, code: 'EPERM', syscall: 'spawn'`로 설치 자체가 실패한다. 대응: `npm install --ignore-scripts`로 라이프사이클 스크립트를 건너뛰고 설치한 뒤, 필요한 스크립트(예: `prisma generate`)는 `node node_modules/prisma/build/index.js generate`처럼 실제 바이너리를 직접 호출해서 수동으로 실행할 것. `npx <cli>`도 내부적으로 같은 방식이라 막힐 수 있으니 `npx` 대신 항상 `node node_modules/<pkg>/<entry>` 직접 호출 패턴을 우선 시도할 것.
  - Vite 8.2.2는 추가로 Windows 설정 로딩 시 내부적으로 `exec("net use")`를 호출(`node_modules/vite/dist/node/chunks/node.js`의 `optimizeSafeRealPathSync`)하는데 이것도 cmd.exe라서 막힌다. 그 `exec(...)` 호출을 `try { ... } catch { safeRealpathSync = fs.realpathSync.native; }`로 감싸면 우회되지만(네트워크 드라이브 판별만 건너뜀, 로컬 드라이브엔 영향 없음), `node_modules`는 git에 안 잡히므로 `npm install`을 다시 하면 사라지는 임시 조치임 — 필요할 때마다 다시 적용.
- **이 PC방 컴퓨터(같은 네트워크)는 추가로 Postgres 기본 포트(5432) 아웃바운드 자체를 막아놓음(확인됨: 2026-09-11).** 443(HTTPS)은 정상 연결됨. 그래서 `DATABASE_URL`이 정확해도 `prisma migrate`/일반 TCP 기반 Postgres 클라이언트는 전부 `P1001: Can't reach database server`로 타임아웃남 — Neon 프로젝트나 연결 문자열 문제가 아니라 네트워크 정책 문제였음. 대응: 서버(`server/`)는 표준 TCP 대신 **Neon의 HTTP/WebSocket 기반 드라이버(`@neondatabase/serverless` + `@prisma/adapter-neon`)로 접속**하도록 만들어둠 — 이건 443 포트만 쓰므로 이 네트워크에서도 정상 동작함(자세한 내용과 마이그레이션 적용 방법은 [docs/BACKEND.md](docs/BACKEND.md) 참고). 다른(제약 없는) 네트워크에서 작업할 땐 이 어댑터가 오히려 불필요할 수도 있지만, 굳이 걷어낼 필요는 없음 — 어차피 정상 동작함.
