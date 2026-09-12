# 백엔드 아키텍처 결정 기록

프로토타입 단계(Mock 데이터, Mock 로그인, localStorage 영속화)를 벗어나 실제 배포를 준비하기 위한
백엔드 방향을 정리한 문서. 구현 전 논의 단계에서 확정된 내용이며, 실제 구현하면서 세부는 조정될 수 있음.

## 결정된 스택
- **서버**: Node + Express (직접 구현). BaaS(Supabase/Firebase)도 검토했지만, 백엔드를 직접 다뤄보고
  완전히 통제하고 싶다는 이유로 이쪽을 선택함.
- **DB**: PostgreSQL, 호스팅은 **Neon**(서버리스 Postgres) — 무료 티어가 넉넉하고 연결 문자열만
  있으면 바로 붙일 수 있어서 Render/Railway의 무료 Postgres보다 제약이 적음.
- **DB 접속 방식**: 표준 TCP(5432) 대신 **`@neondatabase/serverless` + `@prisma/adapter-neon`으로
  HTTP/WebSocket(443) 접속**. 원래는 표준 방식으로 시작했다가, 이 PC방 네트워크가 5432 포트 아웃바운드
  자체를 막아놓은 걸 발견해서(아래 "왜 이렇게 결정했는지" 참고) 전환함. 다른 네트워크에서도 문제없이
  동작하고 오히려 서버리스 환경 친화적이라 그대로 유지하기로 함.
- **ORM**: **Prisma** — 이번이 첫 ORM 사용이라 문서·자료가 가장 풍부한 쪽으로 시작.
- **인증**: 직접 구현. `bcrypt`로 비밀번호 해싱, `jsonwebtoken`으로 JWT 발급, 세션은 **httpOnly 쿠키**에
  저장(XSS에 더 안전한 쪽 선택).
- **저장소 구조**: **모노레포** — 기존 레포에 `server/` 디렉토리를 추가하고 별도 레포를 만들지 않음.
  PC방 워크플로우상(여러 컴퓨터를 오가며 git pull/push로 이어감) 레포 하나만 동기화하면 프론트+백엔드가
  같이 따라오는 게 훨씬 유리함.
- **배포**: 프론트는 Vercel/Netlify 중 택1(서버리스 함수를 안 쓰므로 둘 다 차이 거의 없음), 백엔드는
  **Render** 추천(무료 티어 있음, 다만 idle 시 슬립됨). 확정은 실제 배포 단계에서.

## 왜 이렇게 결정했는지
- [CLAUDE.md](../CLAUDE.md)에 기록된 **cmd.exe 스폰 차단 이슈는 `npm run <script>` 한정 문제**로 확인됨.
  Express 서버는 `node server/index.js`처럼 바이너리를 직접 실행하면 로컬(PC방 포함)에서 문제없이
  돌아감. 단, npm script로 감싸서 실행하면(`npm run server`) vite/oxlint 때와 똑같이 조용히 멈출 수
  있으니 **항상 직접 실행**할 것. `npx prisma ...`도 내부적으로 같은 계열 문제가 있을 수 있어
  실제로 써볼 때 검증 필요 — 막히면 `node node_modules/prisma/build/index.js ...` 식으로 우회.
- 프론트/백엔드가 서로 다른 도메인에 배포되므로 **CORS(`credentials: true`) + 쿠키 `sameSite`/`secure`
  설정**에 유의해야 함 — 로컬 개발은 http라 `sameSite: 'lax'`, 배포 후엔 https 교차 도메인이라
  `sameSite: 'none'; secure: true`가 필요함. 환경별 분기 처리를 잊지 말 것.
- **이 PC방 네트워크가 Postgres 기본 포트(5432) 아웃바운드를 막아놓은 걸 확인함(2026-09-11)** — 같은
  Neon 호스트의 443(HTTPS/WSS)은 정상 연결되는데 5432는 완전히 타임아웃남(`P1001`). 그래서 표준
  `@prisma/client`(TCP)로는 이 네트워크에서 로컬 개발 자체가 불가능했음. 해결: Neon이 공식 제공하는
  HTTP/WebSocket 기반 드라이버(`@neondatabase/serverless`)를 Prisma 어댑터(`@prisma/adapter-neon`)로
  붙여서 443만으로 통신하게 전환 — `src/lib/prisma.js`, `prisma/seed.js` 둘 다 이 방식으로 `PrismaClient`를
  생성함. 실제로 signup/login/memes/scraps 엔드포인트 전부 이 방식으로 동작 확인됨.
  - 부작용 하나: **`prisma migrate dev`/`deploy` 명령어 자체는 여전히 안 됨** — CLI의 마이그레이션
    엔진은 어댑터를 안 타고 자체적으로 TCP 접속을 시도하기 때문. 그래서 초기 스키마는
    `prisma migrate diff --from-empty --to-schema-datamodel ... --script`로 SQL만 오프라인으로
    생성(이건 DB 연결이 필요 없음)한 뒤, `@neondatabase/serverless`의 `Pool`로 그 SQL을 직접 실행하는
    식으로 적용했음(`prisma/migrations/20260911140000_init/migration.sql`). **`_prisma_migrations`
    이력 테이블엔 이 마이그레이션이 기록 안 돼 있음** — 5432가 뚫리는 네트워크(집 등)에서 작업할 기회가
    있으면 `prisma migrate resolve --applied 20260911140000_init`로 한 번 동기화해줄 것.
    **주의(2026-09-12 발견)**: `--from-empty`는 테이블이 하나도 없는 최초 마이그레이션에서만 써야 함
    — 이미 테이블이 있는 상태에서 스키마를 추가/변경할 땐 `--from-migrations prisma/migrations
    --to-schema-datamodel prisma/schema.prisma --script`로 기존 마이그레이션 이력 기준 증분 SQL만
    생성해야 함(`--from-empty`를 계속 쓰면 이미 있는 테이블까지 다시 `CREATE TABLE`하려다 충돌함).
    SQL을 직접 실행하는 스크립트는 매번 새로 짜지 않고 `server/prisma/apply-migration.js`로 고정해서
    재사용하기로 함(`node prisma/apply-migration.js <migration.sql 경로>`).
  - 설치된 `@prisma/adapter-neon`(7.10.0)이 `@prisma/client`/`prisma`(6.19.3)보다 메이저 버전이 높은
    상태로 섞여 있음 — 실제 쿼리는 정상 동작 확인했지만, 나중에 Prisma를 업그레이드할 때 이 버전 조합을
    다시 점검할 것.

## 데이터 모델 초안 (확정 아님, 구현 시 다시 다듬을 것)
- `memes` — 기존 `MEMES`([src/data/memes.js](../src/data/memes.js)) 필드 대부분을 컬럼화. 검색/필터/정렬에
  쓰이는 값(이름, 카테고리, 화제성 수치, 등록일)만 컬럼으로 정규화하고, timeline·관련영상·관련인물처럼
  "상세페이지에서 통째로 읽고 필터링은 안 하는" 서술형 블록은 JSONB로 — 굳이 다 테이블로 쪼개면
  오버엔지니어링.
- `verification` (+ sources, changeLog) — 오늘 만든 [VerificationBadge](../src/components/VerificationBadge.jsx)
  인증마크 구조를 테이블로 옮김.
- `users` — Auth 유저 테이블. 컬럼: `email`, `nickname`, `username`(로그인용 아이디, email과 별개),
  `realName`(실명), `birthDate`, `phone`, `passwordHash`, `role`(`user`/`editor`/`admin`). **로그인은
  email이 아니라 username 기준**(2026-09-11 사용자 요청으로 변경). `username`/`realName`/`birthDate`/
  `phone`은 최초 스키마 초안엔 없었는데 실제 회원가입 요구사항(실명 기반 가입 + 아이디 로그인)이
  나오면서 추가함. `username`·`email`·`phone` 전부 unique 제약. 프로필 수정(`PATCH /auth/me`)에서는
  `username`·`birthDate`는 신원 확인용 고정값으로 보고 수정 불가, 나머지(`nickname`/`email`/`realName`/
  `phone`)만 수정 가능하게 함 — 필요하면 나중에 조정.
- `scraps` — `user_id` + `meme_id` 조인 테이블. 기존 localStorage 스크랩을 대체.
- `submissions` — [STRATEGY.md](STRATEGY.md) 2-6 "제보 → 에디터 승인 큐" 절충안을 위한 테이블
  (status: `pending` / `approved` / `rejected`, `reviewed_by`, `reviewed_at`).
- `recently_viewed`(2026-09-12 추가, 아직 마이그레이션 미적용) — `(userId, memeId)` 조합당 한 행,
  볼 때마다 `viewedAt`만 갱신(upsert)하고 조회 시 내림차순 최근 5개만 가져옴. 처음엔 낮은 우선순위라
  localStorage 유지로 남겨뒀었는데, 2026-09-12에 나머지 미완성 기능들과 함께 서버 이관하기로 범위에
  다시 포함시킴.

## API 엔드포인트 (구현 완료, 실제 코드 기준)
- `POST /auth/signup`(username/password/nickname/email/realName/birthDate/phone 전부 필수),
  `POST /auth/login`(**username**+password), `POST /auth/logout`, `GET /auth/me`,
  `PATCH /auth/me`(nickname/email/realName/phone 수정, username/birthDate는 불변)
- `GET /memes`(검색/필터 쿼리: `?category=`, `?q=`), `GET /memes/:id`
- `GET /scraps`(로그인 필요), `POST /scraps/:memeId`, `DELETE /scraps/:memeId`
- `POST /submissions`(제보), `GET /submissions`(에디터는 전체 큐, 일반 유저는 자기 것만),
  `PATCH /submissions/:id`(승인/반려, 에디터 전용)
- `PATCH /memes/:id/verification`(인증마크 갱신, 에디터 전용)
- `GET /users`(admin 전용, 목록 — PII 최소화해서 id/username/nickname/email/role만),
  `PATCH /users/:id/role`(admin 전용, 역할 변경) — 2026-09-12 신규
- role 체크는 `requireAuth`(JWT 검증) 다음에 `requireEditor`/`requireAdmin` 미들웨어를 붙이는 식으로 처리
  (`server/src/middleware/auth.js`)
- `server/src/routes/recentlyViewed.js`: 작성만 돼 있고 **아직 `index.js`에 마운트 안 됨** + 대응하는
  `RecentlyViewed` 모델도 스키마엔 추가됐지만 마이그레이션 미적용 — 죽은 코드 상태([docs/PROGRESS.md](PROGRESS.md)
  "진행 중" 참고).

## 진행 상황 (2026-09-11)
- **완료**: `server/` 스캐폴드(Express 골격, `src/lib`, `src/middleware`, `src/routes`), Prisma 스키마
  작성(`prisma/schema.prisma`), 인증 API(`/auth/signup|login|logout|me`), `/memes`(목록/상세/인증마크 PATCH),
  `/scraps`(CRUD), `/submissions`(등록/조회/승인·반려) 라우트 코드, Mock 데이터 이관용 시드 스크립트
  (`prisma/seed.js`). `node src/index.js`로 기동 확인, `/health` 응답 확인, 에러 핸들러가 프로덕션에서
  내부 에러 메시지를 안 새게 처리 확인.
- **Neon 프로젝트 생성 완료(사용자), DB 연동 끝까지 검증 완료**: 5432 포트 차단 발견 → Neon HTTP/WebSocket
  어댑터로 전환(위 "왜 이렇게 결정했는지" 참고) → 초기 스키마 마이그레이션 SQL 생성 및 직접 적용(테이블
  6개 생성 확인: users/memes/meme_ranks/verifications/scraps/submissions) → `node prisma/seed.js`로 Mock
  9개 밈 이관 완료 → 서버 기동 후 signup/login/me/memes 목록/상세/scraps 추가·조회/에러 케이스(미인증
  401, 중복 가입 409, 잘못된 비밀번호 401)까지 curl로 전부 실제 동작 확인. 테스트로 만든 계정은 삭제해둠.
- **프론트 `AuthView` 연동 완료**: [src/lib/api.js](../src/lib/api.js) 신규(fetch 래퍼, 매 요청에
  `credentials: "include"`). `AuthView`가 이제 실제 `/auth/signup`·`/auth/login`을 호출하고 에러 메시지를
  화면에 보여줌(비밀번호칸도 이전엔 값이 아예 캡처 안 되던 버그가 있었음 — 같이 고침). `useAppState`는
  localStorage 대신 앱 로드 시 `GET /auth/me`로 세션을 확인하고, 로그아웃도 서버 쿠키를 실제로 지움.
  로컬 프론트(Vite)용 `.env.example`/`VITE_API_URL` 추가. 개발 중 Vite 포트가 계속 바뀌는 문제 때문에
  서버 CORS를 프로덕션 외엔 `localhost:아무포트나` 허용하도록 완화(`server/src/index.js`).
  프론트+백엔드 동시 기동 후 회원가입→쿠키 발급→닉네임 저장까지 end-to-end 확인.
  (참고: curl 명령줄 인자로 한글을 직접 넘기면 이 Windows 콘솔 환경에서 인코딩이 깨짐 — 실제 앱 버그
  아님. 한글 포함 요청은 JSON 파일로 `--data-binary @file.json`처럼 넘겨서 테스트할 것.)
- **중요 발견 1**: `npm install`도 Prisma처럼 postinstall 스크립트가 있는 패키지가 끼면 cmd.exe 스폰
  차단에 걸려 `EPERM: spawn` 에러로 실패할 수 있음(CLAUDE.md에 있던 "npm install은 안전하다"는 프론트
  의존성 한정 얘기였음). `npm install --ignore-scripts`로 설치하고, `prisma generate` 같은 건
  `node node_modules/prisma/build/index.js <command>`로 직접 실행하면 우회됨.
- **중요 발견 2**: 이 PC방 네트워크는 5432 포트도 막아놔서 표준 Postgres 접속 자체가 안 됨. Neon
  어댑터로 전환해서 해결(위 참고).
- **회원가입/로그인 필드 확장 + 프로필 수정 기능 추가**: 사용자가 실명 기반 가입 흐름(이메일/닉네임/
  아이디/실명/생년월일/휴대전화번호)과 아이디+비밀번호 로그인을 요청해서 반영. `users` 테이블에
  `username`/`realName`/`birthDate`/`phone` 추가(마이그레이션: `20260911160000_add_user_profile_fields`),
  로그인을 email→username 기준으로 변경, `PATCH /auth/me` 신규(닉네임/이메일/실명/휴대전화번호 수정
  가능, 아이디/생년월일은 불변으로 설계 — 신원 확인용 고정값으로 보는 게 합리적이라 판단, 필요하면
  나중에 바꿀 수 있음). 프론트엔 [EditProfileView](../src/pages/EditProfileView.jsx) 신규(마이페이지에서
  "내 정보 수정" 버튼으로 진입). email/username/phone 중복 시 구체적으로 뭐가 겹쳤는지 알려주는
  409 에러도 curl로 확인함. 이 작업 중에 마이그레이션 적용 전 `users` 테이블에 브라우저로 직접
  테스트하며 만들어진 계정(`111@111`)이 남아있는 걸 발견해서 정리하고 진행함.

## 다음에 구현할 순서
1. ~~`server/` 디렉토리 세팅~~ 완료
2. ~~Neon 프로젝트 생성 + `DATABASE_URL` 연결~~ 완료
3. ~~초기 마이그레이션 적용 + Mock 데이터 시드 + API 전체 동작 확인~~ 완료
4. ~~프론트 `AuthView`를 Mock 대신 실제 API 호출로 교체~~ 완료
5. ~~`/memes` API로 프론트 데이터 fetch를 정적 import에서 교체~~ 완료 (2026-09-12)
6. ~~스크랩 API 프론트 연동~~ 완료 (2026-09-12) — 비로그인 스크랩은 로그인 유도로 확정, 게스트 스크랩 없음
7. ~~에디터 role 관리~~ 완료 (2026-09-12) — `GET/PATCH /users`, `AdminUsersView`. 최초 admin
   부트스트랩은 여전히 DB 직접 수정 필요(그 이후는 화면으로 승격 가능).
8. **최근 본 밈 서버 이관** — 스키마·라우트 코드는 작성해뒀지만 마이그레이션 미적용 + 마운트 안 됨
   (자세한 내용은 [docs/PROGRESS.md](PROGRESS.md) "진행 중" 참고).
9. **인증마크 갱신 UI + `/submissions` 제보 UI** — 두 라우트 다 코드는 있지만 curl 검증 전, UI도
   아직 없음. UI 만들기 전에 curl로 먼저 검증할 것.
10. **커스텀 기간 트렌드를 실제 데이터로** — 새 `MemeDailyStat` 모델 + 조회/검색 이벤트 로깅 API
    필요(AI 기반 외부 데이터 수집은 안 함 — 앱 자체 실사용 신호만 사용).
11. **실제 URL 라우팅** — 새 라이브러리 추가 없이 `history.pushState`/`popstate`를 기존 `view` state에
    얹는 방식으로 결정(9번까지 끝난 뒤, view 이름이 다 나온 다음에 진행).
12. 배포: 프론트(Vercel/Netlify) + 백엔드(Render) + DB(Neon), CORS/쿠키 환경별 설정은 이미 코드에
    구현돼 있음(`server/src/lib/jwt.js`/`index.js`) — 환경변수 설정 + SPA fallback 설정이 메인.
    배포된 백엔드는 일반 네트워크에서도 Neon 어댑터로 잘 동작하는지 재확인.
