# 백엔드 아키텍처 결정 기록

프로토타입 단계(Mock 데이터, Mock 로그인, localStorage 영속화)를 벗어나 실제 배포를 준비하기 위한
백엔드 방향을 정리한 문서. 구현 전 논의 단계에서 확정된 내용이며, 실제 구현하면서 세부는 조정될 수 있음.

## 결정된 스택
- **서버**: Node + Express (직접 구현). BaaS(Supabase/Firebase)도 검토했지만, 백엔드를 직접 다뤄보고
  완전히 통제하고 싶다는 이유로 이쪽을 선택함.
- **DB**: PostgreSQL, 호스팅은 **Neon**(서버리스 Postgres) — 무료 티어가 넉넉하고 연결 문자열만
  있으면 바로 붙일 수 있어서 Render/Railway의 무료 Postgres보다 제약이 적음.
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

## 데이터 모델 초안 (확정 아님, 구현 시 다시 다듬을 것)
- `memes` — 기존 `MEMES`([src/data/memes.js](../src/data/memes.js)) 필드 대부분을 컬럼화. 검색/필터/정렬에
  쓰이는 값(이름, 카테고리, 화제성 수치, 등록일)만 컬럼으로 정규화하고, timeline·관련영상·관련인물처럼
  "상세페이지에서 통째로 읽고 필터링은 안 하는" 서술형 블록은 JSONB로 — 굳이 다 테이블로 쪼개면
  오버엔지니어링.
- `verification` (+ sources, changeLog) — 오늘 만든 [VerificationBadge](../src/components/VerificationBadge.jsx)
  인증마크 구조를 테이블로 옮김.
- `profiles` — Auth 유저 확장 테이블(role: `user` / `editor` / `admin`).
- `scraps` — `user_id` + `meme_id` 조인 테이블. 기존 localStorage 스크랩을 대체.
- `submissions` — [STRATEGY.md](STRATEGY.md) 2-6 "제보 → 에디터 승인 큐" 절충안을 위한 테이블
  (status: `pending` / `approved` / `rejected`, `reviewed_by`, `reviewed_at`).
- `recently_viewed`는 당장 서버로 옮기지 않고 localStorage에 유지 — 기기 동기화 안 돼도 리스크가
  낮은 개인화 기능이라 스코프에서 제외.

## API 엔드포인트 초안
- `POST /auth/signup`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`
- `GET /memes`(검색/필터 쿼리), `GET /memes/:id`
- `POST /memes/:id/scrap`, `DELETE /memes/:id/scrap`, `GET /scraps`
- `POST /submissions`(제보), `GET /submissions`(에디터 큐 조회), `PATCH /submissions/:id`(승인/반려)
- `PATCH /memes/:id/verification`(인증마크 갱신)
- role 체크는 JWT 검증 미들웨어 뒤에 `requireEditor` 같은 별도 미들웨어로 처리

## 진행 상황 (2026-09-11)
- **완료**: `server/` 스캐폴드(Express 골격, `src/lib`, `src/middleware`, `src/routes`), Prisma 스키마
  작성(`prisma/schema.prisma`), 인증 API(`/auth/signup|login|logout|me`), `/memes`(목록/상세/인증마크 PATCH),
  `/scraps`(CRUD), `/submissions`(등록/조회/승인·반려) 라우트 코드, Mock 데이터 이관용 시드 스크립트
  (`prisma/seed.js`). `node src/index.js`로 기동 확인, `/health` 응답 확인, 에러 핸들러가 프로덕션에서
  내부 에러 메시지를 안 새게 처리 확인.
- **막힘/대기 중**: 아직 Neon 프로젝트가 없어서 `server/.env`의 `DATABASE_URL`이 placeholder 상태 —
  실제 DB 연결·마이그레이션·시드·회원가입 API 동작 확인은 Neon 프로젝트 생성 후에 가능.
- **중요 발견**: `npm install`도 Prisma처럼 postinstall 스크립트가 있는 패키지가 끼면 cmd.exe 스폰
  차단에 걸려 `EPERM: spawn` 에러로 실패할 수 있음(CLAUDE.md에 있던 "npm install은 안전하다"는 프론트
  의존성 한정 얘기였음). `npm install --ignore-scripts`로 설치하고, `prisma generate`/`migrate` 같은
  건 `node node_modules/prisma/build/index.js <command>`로 직접 실행하면 우회됨 — 실제로 `generate`는
  이 방식으로 정상 동작 확인함. 자세한 내용은 [CLAUDE.md](../CLAUDE.md)의 "PC방 컴퓨터" 항목 참고.

## 다음에 구현할 순서
1. ~~`server/` 디렉토리 세팅(Express 기본 골격)~~ 완료
2. **Neon 프로젝트 생성 (사용자가 직접 — 계정 필요)** → `server/.env`의 `DATABASE_URL` 채우기
3. `node node_modules/prisma/build/index.js migrate dev --name init`으로 첫 마이그레이션 적용
4. `node prisma/seed.js`로 기존 Mock 9개 밈 이관, `node src/index.js`로 실제 API 동작(회원가입 등) 확인
5. 프론트 `AuthView`를 Mock 대신 실제 API 호출(`fetch(..., { credentials: "include" })`)로 교체
6. `/memes` API로 프론트 데이터 fetch를 정적 import에서 교체
7. 스크랩 API 프론트 연동 (localStorage → 서버)
8. role/제보 큐(`submissions`) 승인 화면 구현
9. 배포: 프론트(Vercel/Netlify) + 백엔드(Render) + DB(Neon), CORS/쿠키 환경별 설정 마무리
