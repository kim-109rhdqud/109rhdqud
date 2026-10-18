# 진행 상황

마지막 업데이트: 2026-10-18

## 완료된 것
- 기본 뷰 구현: 홈, 검색 결과, 밈 상세, 트렌드(기간별 랭킹), 밈 사전(정렬/필터), 역사(연도별 아카이브), 로그인/회원가입(Mock), 마이페이지, 스크랩 목록(독립 화면)
- 스크랩(찜), 최근 본 밈, 로그인 세션 localStorage 영속화 (새로고침해도 유지)
- Mock 데이터 9개 항목 (`src/data/memes.js`의 `MEMES`)
- CLAUDE.md, PROGRESS.md 작성 (PC방 워크플로우용 — git으로 컨텍스트 유지)
- 원본 기획서(초기 제작 프롬프트) 전문을 [docs/SPEC.md](SPEC.md)로 보존, CLAUDE.md에서 참조 연결
- **코드 전면 재작성**: 1227줄짜리 단일 `App.jsx`를 `data/`, `lib/`, `hooks/`, `components/`, `pages/`로 분리. 재작성 과정에서 `vite.config.js`에 `@tailwindcss/vite` 플러그인이 애초에 연결되어 있지 않았던 것을 발견해 수정 — 그동안 Tailwind 유틸리티 클래스가 실제로는 전혀 적용되지 않고 있었음. Vite 스캐폴드 잔재 파일(`App.css`, 미사용 이미지)도 정리.
- SPEC.md 대비 보강한 기능: 관련 밈 섹션을 카테고리별(관련 밈/유행어/상품/챌린지)로 그룹화, 유행 지표에 시간 추이 스파크라인 추가, 검색 결과 없음일 때 유사도 기반 추천으로 개선
- **`npm install` → 빌드 → 린트 → dev 서버까지 전부 실행 검증 완료.** `npm run build`가 Tailwind 유틸리티가 실제로 포함된 CSS(17KB)를 생성하는 것 확인, dev 서버(`localhost:5175`)로 실제 서빙되는 CSS에 `.border-black` 등 클래스가 정상 컴파일되어 있는 것까지 확인. oxlint로 실제 경고 1건(NavBar.jsx에서 렌더 중 컴포넌트 재생성) 발견해 수정 완료, 재실행 시 클린.
- **사용자가 직접 `npm run dev`로 브라우저에서 눈으로 확인 완료** ("아직까지는 좋은거 같아") — 레이아웃·네비게이션 정상 확인됨.
- 위 변경사항 전부 커밋 + push 완료 (`0e5b0bf`).
- **기획 피드백 토론을 [docs/STRATEGY.md](STRATEGY.md)로 정리.** 차별화 전략(콘텐츠 제작자용 원본 소재 라이브러리 + 인증마크 투트랙), 수익모델(프리미엄/B2B + 라이선스 중개) 방향까지 논의됨. CLAUDE.md에서 참조 연결.
- **STRATEGY.md 2-3(인증마크의 순환 신뢰 문제) 해결.** 인증마크의 의미를 "브랜드 권위"가 아니라 "클릭하면 검증 가능한 근거(최초 출처 링크, 독립 출처 2개 이상, 원저작권자 표기, 검수 편집자·검수일, 수정 이력 공개)"로 재정의해 순환 문제를 우회. 이걸로 STRATEGY.md의 모든 스레드(2-1~2-8) 닫힘 — **기획 단계 확정 및 마무리.**
- 새 PC(PC방)에서 세션 재개: Node 신규 설치 확인 → `npm install` → CLAUDE.md에 기록된 Vite `net use`(cmd.exe 스폰 차단) 이슈 재발 확인 및 패치 재적용 → build/lint/dev 서버 재검증 완료.
- **STRATEGY.md 2-3(인증마크의 순환 신뢰 문제) 해결 및 기획 전체 확정.** "브랜드 권위" 대신 "클릭하면 검증 가능한 근거"로 인증마크 의미를 재정의.
- **인증마크(에디터 검증) 기능 구현.** `src/data/memes.js`에 `verification` 필드 추가(알잘딱깔센/오운완/무물 3개 `verified: true` + 출처·검수자·수정이력, 나머지 6개 `verified: false`). [src/components/VerificationBadge.jsx](../src/components/VerificationBadge.jsx) 신규 작성(목록용 배지 + 상세 페이지용 전체 섹션), `MemeCard`/`DetailView`에 연결. build/lint 재검증 완료.
- **백엔드 아키텍처 논의 및 확정** — Node/Express + Neon(Postgres) + Prisma + httpOnly 쿠키 JWT, 모노레포(`server/` 디렉토리) 구조로 결정. 데이터 모델·API 엔드포인트 초안·구현 순서를 [docs/BACKEND.md](BACKEND.md)에 정리.
- **백엔드 골격 구현 + 실제 DB 연동까지 전부 완료** — `server/` 신규(Express 앱, Prisma 스키마, 인증/밈/스크랩/제보 라우트, Mock 데이터 이관용 시드 스크립트). 사용자가 Neon 프로젝트 생성 후, 마이그레이션 적용 → Mock 9개 밈 시드 → signup/login/me/memes/scraps API + 에러 케이스(401/409)까지 curl로 실동작 확인 완료. 테스트 계정은 정리해둠.
- **중요 발견 1**: `npm install`도 Prisma처럼 postinstall 스크립트 있는 패키지가 끼면 cmd.exe 스폰이 막혀서 실패할 수 있음 — `--ignore-scripts`로 설치 후 `node node_modules/prisma/build/index.js generate`처럼 직접 실행하면 우회됨.
- **중요 발견 2(꽤 큼)**: 이 PC방 네트워크는 Postgres 기본 포트(5432)도 막아놔서 표준 TCP로는 DB 접속 자체가 불가능했음(443은 정상). `@neondatabase/serverless` + `@prisma/adapter-neon`으로 HTTP/WebSocket 접속하게 바꿔서 해결 — `prisma migrate dev`는 여전히 이 네트워크에서 안 되므로, 스키마 변경 시 `migrate diff --script`로 SQL만 뽑아서 직접 실행하는 방식을 써야 함. 둘 다 CLAUDE.md/BACKEND.md에 상세히 기록해둠.
- **프론트 `AuthView`를 실제 API에 연결 완료** — `src/lib/api.js` 신규(fetch 래퍼), 로그인/회원가입이 진짜 `/auth/*` API를 호출하고 실패 시 에러 메시지도 화면에 뜸. 로그인 세션은 이제 localStorage가 아니라 **서버의 httpOnly 쿠키**로 관리(앱 로드 시 `/auth/me`로 확인). 이 과정에서 User 스키마에 `nickname` 컬럼이 원래 빠져있던 것(프론트 3곳에서 이미 쓰고 있었음)과 비밀번호 입력값이 아예 캡처 안 되던 버그를 발견해 같이 고침. 프론트+백엔드 동시 기동해서 회원가입→쿠키→닉네임 저장까지 end-to-end 확인 완료.
- **회원가입/로그인 필드 확장 + 프로필 수정 기능 추가** (사용자 요청) — 회원가입 시 닉네임/이메일/아이디/실명/생년월일/휴대전화번호 전부 입력받고, 로그인은 이메일 대신 **아이디**로 하도록 변경. `users` 테이블에 컬럼 4개 추가(마이그레이션), 새 페이지 [EditProfileView](../src/pages/EditProfileView.jsx)로 마이페이지에서 "내 정보 수정"(닉네임/이메일/실명/휴대전화번호, 아이디·생년월일은 불변) 가능. 중복 아이디/이메일/휴대전화번호 각각 구체적인 에러 메시지까지 확인. 자세한 내용은 [docs/BACKEND.md](BACKEND.md) 참고.
- **문서 정합성 점검** — CLAUDE.md/PROGRESS.md/BACKEND.md/STRATEGY.md/SPEC.md를 실제 코드(파일 목록·스키마·라우트)와 대조. SPEC.md에 스크랩 화면 분리가 "아직 갭"이라고 잘못 남아있던 것(실제로는 이미 완료됨)과 CLAUDE.md의 컴포넌트/페이지 목록 누락(VerificationBadge, EditProfileView), `useAppState` 설명 오류(user는 이제 localStorage 아님) 등을 발견해 수정.
- **전면 디자인 리뉴얼** (사용자 요청: "진짜 상용 웹처럼, 화려하지만 정신없지 않게") — 기존의 딱딱한 흑백 모노톤·무그림자·직각 컨벤션을 버리고, 브랜드 그라데이션(보라→핑크→로즈) 한 가지를 로고/CTA/1위 배지 등 포인트에만 쓰는 방식으로 전면 리디자인. 카드에 그림자·둥근 모서리·hover 인터랙션 추가, 카테고리별 색상 태그, 랭킹 등락 빨강/파랑(국내 차트 관행), 인증마크는 에메랄드 톤으로 브랜드 컬러와 구분, 네비게이션은 글래스모피즘(backdrop-blur). `src/index.css`에 `@layer components`로 재사용 유틸리티(`btn-primary`, `input-field`, `surface-card` 등) 추가하고 모든 컴포넌트·페이지(총 22개 파일)에 일관 적용. README.md도 Vite 스캐폴드 기본 문구에서 실제 프로젝트 설명으로 교체. Tailwind v4에서 커스텀 클래스를 `@apply`로 중첩할 수 없다는 것도 확인(빌드 에러로 발견, 우회함). build/lint 클린.
- **디자인 후속 다듬기** (사용자 피드백) — 네비게이션의 아바타+로그아웃 아이콘이 뭘 누르는 자리인지 불명확하다는 지적 반영해 "아바타+닉네임+화살표 → 드롭다운(마이페이지/내 정보 수정/로그아웃)" 메뉴로 교체([src/components/NavBar.jsx](../src/components/NavBar.jsx)). 화면 전환이 너무 뚝뚝 끊긴다는 지적도 반영해 전체 화면 전환에 페이드+슬라이드 애니메이션 추가, 로그인/회원가입 성공 시 바로 넘기지 않고 체크마크 확인 화면을 짧게 보여주도록 변경([src/pages/AuthView.jsx](../src/pages/AuthView.jsx)).

## 완료된 것 (2026-09-12 세션 추가)
- **밈 데이터를 정적 import에서 `GET /memes` API로 완전 교체.** `src/lib/api.js`에 `getMemes`/`getScraps`/`addScrap`/`removeScrap` 추가 + 서버 응답을 기존 Mock 데이터 형태로 맞춰주는 `normalizeMeme()` 정규화 로직 추가. `data/rank.js`와 페이지 9개(HomeView/SearchResultsView/DetailView/TrendView/DictionaryView/ArchiveView/ScrapsView/MyPageView/SearchBar/NavBar)를 정적 import 대신 props로 받도록 리팩터. `CATEGORIES`는 정적 유지(DB 이관 대상 아님), `MEMES`/`memeById`는 이제 `server/prisma/seed.js` 전용(지우면 안 됨).
- **스크랩(찜)을 localStorage에서 서버로 완전 이관.** 비로그인 스크랩은 로그인 화면으로 유도하기로 확정(하이브리드 대신 이 방식 선택 — 게스트 스크랩 없음). `useAppState`가 로그인 시에만 `GET /scraps`로 채우고, `toggleScrap`은 낙관적 업데이트 후 실패 시 롤백.
- **검증**: build/lint 클린 + 헤드리스 크롬을 CDP로 직접 조작해서 실제 클릭 시나리오 전부 확인(회원가입→로그인→상세페이지 스크랩→**localStorage를 강제로 지우고 새로고침해도 스크랩 유지**되는 것까지 확인해서 서버 연동 증명). 인증마크 배지도 정상 표시, 콘솔 에러 없음.
- **사용자 역할 관리(신규) 구현.** `requireAdmin` 미들웨어 추가, `GET /users`(admin 전용, PII 최소화해서 nickname/username/email/role만 반환)·`PATCH /users/:id/role` 신규 라우트. 프론트 [AdminUsersView](../src/pages/AdminUsersView.jsx)(admin만 접근, 네비 드롭다운의 "사용자 관리")에서 유저 목록 보고 역할(user/editor/admin) 바로 변경 가능. 최초 admin 계정(`admin`)은 사용자가 직접 회원가입 후 DB에서 role 컬럼 수동 변경으로 부트스트랩 완료 — curl + 실제 admin 계정으로 헤드리스 브라우저 테스트까지 end-to-end 확인.
- 코드 리뷰 통과: `GET /users`가 애초엔 실명/생년월일/휴대폰까지 다 내려주고 있었던 것(불필요한 PII 노출)과 `AdminUsersView`의 미처리 promise rejection을 리뷰에서 잡아서 수정함.
- **설계 검토 완료 — 남은 6개 기능(아래 "진행 중" 참고)의 구현 순서·아키텍처 결정까지 정리해둠.** 라우팅은 새 라이브러리(react-router 등) 대신 기존 `view` state에 `history.pushState`/`popstate`만 얹는 방식으로 결정(이 프로젝트가 지금까지 의존성을 최소로 유지해온 방향과 일치). 커스텀 기간 트렌드는 AI 기반 외부 데이터 수집 없이, 앱 자체 실사용 신호(조회수/검색량)를 매일 스냅샷으로 쌓는 자체 애널리틱스로 대체하기로 함(배포 직후엔 데이터 거의 없다는 점 사용자에게 고지 필요).

## 완료된 것 (2026-09-13 세션 추가)
- **새 PC(PC방) 세팅 재확인** — Node v24.21.0 기설치 확인. 루트/서버 모두 `node_modules` 없는 상태였어서 새로 설치: 루트는 평범한 `npm install`, 서버는 `npm install --ignore-scripts`(prisma postinstall 회피) 후 `node node_modules/prisma/build/index.js generate`.
- **`npm install`이 성공해도 일부 패키지가 손상된 채 설치될 수 있다는 새 이슈 발견 및 해결** — `@tailwindcss/oxide-win32-x64-msvc`의 네이티브 바이너리 손상, `lucide-react` 아이콘 파일 대량 누락(4000여 개 중 1155개만 설치됨, `index.mjs` 포함) 두 건 모두 재현됨. 원인은 이 네트워크의 다운로드 불안정으로 추정. 해당 패키지(또는 전체 `node_modules`+`package-lock.json`) 재설치로 둘 다 해결. Vite의 `net use`/cmd.exe 우회 패치도 새 `node_modules`에 재적용함(둘 다 CLAUDE.md에 기록).
- **최근 본 밈 서버 이관 — 코드 작업 완료.** `server/src/index.js`에 `/recently-viewed` 라우트 마운트, `src/lib/api.js`에 `getRecentlyViewed`/`recordRecentlyViewed` 추가, `useAppState.js`를 스크랩과 동일 패턴(로그인 시에만 서버 fetch/기록, 비로그인 추적 안 함)으로 교체하고 이제 안 쓰는 `src/lib/storage.js` 삭제(localStorage 완전히 걷어냄). 빌드/린트 클린, `curl`로 `/health`·`/recently-viewed`(401 확인)까지 서버 기동 후 확인 완료.
- 스키마 변경분(`RecentlyViewed` 테이블) 마이그레이션 SQL도 생성해둠 — `server/prisma/migrations/20260913180750_add_recently_viewed/migration.sql`. 이 과정에서 `migrate diff --from-migrations`가 문서와 달리 shadow database(=5432 TCP)를 요구해서 이 네트워크에선 안 된다는 것 발견 → 스키마 스냅샷 두 개를 직접 비교하는 `--from-schema-datamodel` 방식으로 우회(CLAUDE.md에 상세 기록). `prisma/migrations/migration_lock.toml`이 애초에 없었던 것도 발견해서 새로 만듦.
- **DB 마이그레이션 적용 완료 + 실동작 확인 완료.** 실제 `DATABASE_URL`을 `server/.env`에 채우고 `apply-migration.js`로 `recently_viewed` 테이블 생성. curl로 비로그인 401, 조회 기록 204, 같은 밈 재조회 시 upsert로 중복 안 쌓이는 것, 최신순 정렬, 5개 초과 시 5개로 잘리는 것까지 전부 확인. 이 항목 완전히 끝남.
- **제보(밈 제안) → 승인 → 실제 밈 등록 흐름 신규 구현.** [SubmitMemeView](../src/pages/SubmitMemeView.jsx)(제보 폼, 이름/카테고리/한줄설명/출처 링크), [MySubmissionsView](../src/pages/MySubmissionsView.jsx)(내 제보 목록, 역할 무관 항상 본인 것만 보이는 `GET /submissions/mine` 신규 분리), [SubmissionQueueView](../src/pages/SubmissionQueueView.jsx)(에디터/관리자 전용 승인 큐, `GET /submissions`는 이제 에디터 전용). 원래 계획엔 없었지만 승인만으론 부족하다는 걸 확인해서(아래 참고) 승인된 제보를 실제로 `POST /memes`로 등록하는 [RegisterMemeView](../src/pages/RegisterMemeView.jsx)까지 같이 만듦 — Meme 스키마 전체 필드(설명 3종/플랫폼/키워드/유행 지표/타임라인/관련영상/관련인물/관련밈)를 채우는 폼, 제보 내용으로 이름/카테고리/한줄소개 미리 채움. `Submission.registeredMemeId` 컬럼 추가(마이그레이션 `20260913200000_add_submission_registered_meme`)해서 같은 제보가 중복 등록되는 걸 막음.
- **인증마크 갱신 UI 신규 구현.** `PATCH /memes/:id/verification`을 curl로 먼저 검증하다가 "인증됨인데 출처가 1개뿐이어도 통과되는" 검증 누락을 발견해 서버에 "독립 출처 2개 이상" 체크 추가(STRATEGY.md 2-3 기준). [DetailView](../src/pages/DetailView.jsx)에 에디터/관리자 전용 [VerificationEditForm](../src/components/VerificationEditForm.jsx) 신규 추가(인증 토글, 출처 추가/삭제, 원저작권자, 수정 메모 → changeLog에 쌓임).
- **코드 리뷰로 실제 버그 여러 건 발견·수정** — ① 제보 승인/반려 낙관적 업데이트의 롤백이 스냅샷 클로저 방식이라 동시에 다른 항목을 처리하면 그 변경을 덮어쓰는 문제 → 서버 재조회 방식으로 수정. ② 밈 등록 시 ID 중복 체크가 사전 체크만 있어서 동시 요청 레이스에 취약 → DB 고유 제약 위반(P2002)을 잡아 409로 변환. ③ **가장 중요**: 같은 제보의 중복 등록 방지 로직이 `$transaction`으로만 감싸져 있었는데, Postgres 기본 격리 수준(READ COMMITTED)에서는 그것만으론 두 동시 요청을 못 막는다는 걸 리뷰에서 지적받음 — `tx.submission.updateMany({ where: { id, registeredMemeId: null }, ... })` 조건부 원자적 UPDATE로 교체하고, 실패 시 방금 만든 밈까지 롤백되는 것까지 curl로 재검증. ④ 제보 카드 마크업이 3곳에 복붙돼 있던 것을 [SubmissionCard](../src/components/SubmissionCard.jsx)로 공용화.
- 위 전부 build/lint 클린 + curl로 각 API의 정상/에러 케이스(401/403/404/409/400) 전부 실동작 확인, 테스트 계정·데이터는 매번 정리. 커밋 + push 완료(`e97bcf5`).
- **실제 URL 라우팅 구현 완료.** [src/lib/routes.js](../src/lib/routes.js) 신규(view state ↔ 실제 경로 매핑, 라우팅 라이브러리 없이 `history.pushState`/`popstate`) — `useAppState.js`의 `setView`에 연결. 기존 `setView(...)` 호출부(~40곳)는 전혀 안 건드림. `registerMeme`의 prefill(제보 큐에서 넘어올 때 채워지는 값)은 URL에 안 실림(새로고침하면 빈 폼 — 북마크 대상 아닌 일회성 화면이라 의도적). build/lint 클린, Vite dev 서버에서 모든 경로 curl로 200 확인. 브라우저 뒤로가기/새로고침 직접 확인은 사용자가 진행 중.
- **배포 착수 — 백엔드(Render) 완료, 프론트(Vercel)는 중단(폰 필요).**
  - 배포 전 실제 버그 발견: `server/package.json`에 `prisma`가 devDependencies에 있고 `generate` 자동 실행 스크립트가 없어서 Render에서 Prisma Client가 안 만들어질 뻔함 → `prisma`를 dependencies로 옮기고 `postinstall: prisma generate` 추가(Prisma 공식 권장 방식).
  - Render가 Node 서비스 기본 Build Command로 `npm install; npm run build`를 쓰는데 `server/`엔 `build` 스크립트가 없어서 첫 배포 실패(`Missing script: "build"`) → 무해한 `"build": "echo ..."` 추가해서 해결.
  - 루트에 `vercel.json`(SPA rewrite) 추가 — 실제 경로가 생겼으니 배포 후 `/meme/:id` 같은 딥링크 새로고침 시 404 안 나게.
  - **Render 배포 성공 + 검증 완료**: `https://trend-book.onrender.com` — `/health` 200, `/memes` 9개 정상 반환(Neon 연결 확인). 환경변수: `DATABASE_URL`/`JWT_SECRET`/`NODE_ENV=production` 설정 완료, `CLIENT_ORIGIN`은 아직 플레이스홀더(Vercel URL 나오면 업데이트 필요).
  - **Vercel은 GitHub 레포 연결까지 진행했는데 계정 2FA(인증 앱) 설정 화면에서 멈춤 — 휴대폰이 있어야 진행 가능해서 다음 세션으로 미룸.**

## 완료된 것 (2026-09-14 세션 추가)
- **새 PC 세팅** — Node v24.21.0 기설치 확인, git identity도 이미 설정돼 있었음(`109kim`). 루트 `npm install` + 서버 `npm install --ignore-scripts` → `prisma generate` 수동 실행, Vite `net use` 패치 재적용, build/lint 클린 확인. 루트/서버 `.env` 템플릿에서 새로 생성 — `DATABASE_URL`(Neon pooled connection string)과 `JWT_SECRET`은 사용자가 보관해둔 값 붙여넣음.
- **Vercel 배포 완료.** 2FA는 이미 통과된 상태였음(지난 세션 우려와 달리 이번엔 로그인만으로 바로 대시보드 진입). 레포 import → Environment Variables에 `VITE_API_URL=https://trend-book.onrender.com` 자동 감지된 값 그대로 Deploy. 프로덕션 URL: `https://109rhdqud.vercel.app`.
- Render의 `CLIENT_ORIGIN`을 Vercel URL로 갱신 → 자동 재배포 성공 확인(로그 확인: `prisma generate` postinstall 정상 실행, `npm start`로 서비스 기동).
- **end-to-end 최종 확인 완료** — 실제 Vercel URL에서 로그인 세션 유지(admin 계정으로 로그인된 상태 확인), 밈 사전 페이지 실제 DB 데이터 정상 로드(CORS 정상), 밈 상세 페이지 진입 후 새로고침해도 404 없이 정상 로드(URL 라우팅 확인), 스크랩 추가/조회 정상 동작까지 사용자가 직접 브라우저로 확인. **배포 완전히 끝남.**
- **배포 후 코드 리뷰로 보안 취약점 발견 및 수정** — 로그인/회원가입에 rate limit이 전혀 없어서(실명/생년월일/휴대전화까지 수집하는 앱이 무제한 로그인 시도에 노출된 상태) `express-rate-limit`으로 IP당 15분/10회 제한 추가, Render 프록시 뒤에서 실제 클라이언트 IP를 보려고 `trust proxy` 설정도 같이 켬. 로컬 curl로 `RateLimit-Remaining` 헤더 감소하는 것까지 확인.
- 위 전부 build/lint 클린, 커밋+push 완료.
- 기존 테스트 계정 6개는 admin만 남기고 전부 삭제함(2026-09-15) — 연결된 제보(Submission) 2건도 같이 지워야 삭제가 됐음(FK 제약).

## 2026-10-18
- 회원가입/로그인은 아이디+비밀번호 일반 폼 하나로만 유지하기로 결정 — 그 외 가입/인증 관련 부가 기능은 코드·스키마·문서에서 전부 제거함.
- **밈 수정/삭제 기능 추가.** 상세 페이지에 에디터 이상은 "수정"(등록 폼을 기존 값으로 채워서 재사용, `/meme/:id/edit`), 관리자는 "삭제" 버튼. 서버 `PATCH /memes/:id`(에디터)·`DELETE /memes/:id`(관리자) 신규. 밈 id는 공유 링크가 깨지지 않게 수정 불가. 삭제하면 랭킹/인증마크/스크랩/최근 본 기록이 같이 지워지고, 다른 밈의 관련 밈 목록에서도 빠지고, 이 밈으로 등록됐던 제보는 다시 등록 가능한 상태로 돌아감. DB 스키마 변경 없음.
- 검증: 로컬 Postgres에 시드 데이터를 넣고 API 시나리오 32개(권한 401/403, 검증 400, 없는 밈 404, 기존 등록 API 회귀, 삭제 시 연관 데이터 정리)와 브라우저(Playwright) UI 시나리오 16개 전부 통과. build/lint 클린.

## 진행 중 / 다음에 할 일

### 다음 세션 최우선
- **라이브 DB(Neon) 정리 SQL 한 번 실행** — 코드/스키마에서 지운 `users` 컬럼이 DB엔 아직 남아있음(앱 동작엔 지장 없음). 아래 SQL을 임시 파일로 저장해 `node prisma/apply-migration.js <파일>`로 실행하고, 실행 후 이 항목은 지울 것. `SET NOT NULL`은 해당 컬럼이 null인 행이 있으면 실패함(admin 계정만 남아있어서 문제 없을 것).
  ```sql
  DROP INDEX IF EXISTS "users_emailVerificationToken_key";
  DROP INDEX IF EXISTS "users_kakaoId_key";
  DROP INDEX IF EXISTS "users_googleId_key";
  ALTER TABLE "users" DROP COLUMN IF EXISTS "emailVerified", DROP COLUMN IF EXISTS "emailVerificationToken", DROP COLUMN IF EXISTS "emailVerificationExpiresAt", DROP COLUMN IF EXISTS "kakaoId", DROP COLUMN IF EXISTS "googleId";
  ALTER TABLE "users" ALTER COLUMN "email" SET NOT NULL, ALTER COLUMN "username" SET NOT NULL, ALTER COLUMN "realName" SET NOT NULL, ALTER COLUMN "birthDate" SET NOT NULL, ALTER COLUMN "phone" SET NOT NULL, ALTER COLUMN "passwordHash" SET NOT NULL;
  ```
- Render Environment 탭에 넣어둔 관련 키(`SERVER_ORIGIN`, `RESEND_*`, `KAKAO_*`, `GOOGLE_*`)가 있으면 삭제. 카카오 디벨로퍼스/Google Cloud Console/Resend에 만들어둔 앱·키도 필요 없으면 삭제.

### 완료된 6개 기능
**사용자 확정: 아래 6개 기능 전부 구현(AI 기반 외부 데이터 수집만 제외).** 설계 검토에서 나온 권장 순서:

1. ~~사용자 역할 관리~~ **완료** (위 참고)
2. ~~최근 본 밈 서버 이관~~ **완료** (마이그레이션 적용 + curl 실동작 확인까지, 위 참고)
3. ~~인증마크 갱신 UI~~ **완료** (위 참고 — curl 검증 중 출처 개수 미검증 버그 발견해 같이 고침)
4. ~~제보(Submission) UI~~ **완료** (제보 폼/내 제보 목록/승인 큐 3화면 + 승인된 제보를 실제 밈으로 등록하는 화면까지, 위 참고)
5. **실제 트렌드 데이터 (커스텀 기간)** — `rank.js`의 해시 기반 가짜 생성(`customRankList`)을 실제 데이터로 교체. 새 모델 `MemeDailyStat`(memeId+date+views+searches, 이벤트마다 upsert 증가) 추가, `POST /memes/:id/view`·`POST /search-events`(둘 다 비로그인 허용 — 실사용 신호라 익명도 카운트) + `GET /memes/trend/custom` 신규. `TrendView`의 커스텀 기간 분기가 동기 함수에서 비동기 fetch로 구조 자체가 바뀌는 게 이 작업의 핵심 — `rank.js`의 `customRankList`/해시 함수는 삭제. **배포 직후엔 데이터가 거의 비어있음 — UI에 그 점을 고지할 것.**
6. ~~실제 URL 라우팅~~ **완료** (위 참고)
7. ~~배포~~ **완료** — 백엔드(Render) `https://trend-book.onrender.com`, 프론트(Vercel) `https://109rhdqud.vercel.app`. `CLIENT_ORIGIN` 연결 + end-to-end 확인까지 전부 끝남(위 2026-09-14 세션 항목 참고).

설계 검토 결과 전문은 이 세션 대화에만 있고 별도 문서화는 안 함 — 다음 세션에서 이어갈 때 위 요약이면 충분할 것.

부가 사항:
- 새 PC에서 세션 시작할 땐 `server/.env`뿐 아니라 **루트 `.env`도** git에 안 잡히니 `.env.example` 보고 새로 만들어야 함(`VITE_API_URL`, 로컬이면 보통 `http://localhost:4000`).
- STRATEGY.md에 남겨둔 작은 논리 틈(2-1의 AI 생성 소스 위계, 2-7의 타깃 불일치)은 급하지 않음 — 여유 있을 때 다듬을 것.
- 원본 소재 라이브러리(효과음·자료화면), 프리미엄/B2B 수익모델은 아직 어떤 화면/기능으로 구현할지 미정 — 위 순서보다 후순위.

## 알려진 한계
- 커스텀 기간 트렌드는 가짜 데이터(위 "진행 중" 5번에서 실제 데이터로 교체 예정)
- 최초 admin 계정 부트스트랩은 여전히 DB 직접 수정 필요(그 이후 승격은 관리 화면으로 가능)
- `server/` 의존성에 npm audit 취약점 5건(moderate 2, high 3) 확인만 하고 조치 안 함
- 자동화 테스트(유닛/통합)가 전혀 없음 — 지금까지 전부 수동 curl/브라우저 검증으로만 확인

## 세션 마무리 체크리스트
- [ ] 이 파일의 "진행 중 / 다음에 할 일" 업데이트
- [ ] `git add` → `git commit` → `git push`
