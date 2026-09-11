# 진행 상황

마지막 업데이트: 2026-09-11

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

## 진행 중 / 다음에 할 일
- **다음 세션 핵심 과제 — [docs/BACKEND.md](BACKEND.md) "다음에 구현할 순서" 5번부터**: `/memes` API로 프론트 데이터 fetch를 정적 import에서 교체 (거의 모든 페이지가 영향받는 큰 작업이라 페이지 단위로 나눠서 진행 추천).
- 이어서: 스크랩을 localStorage에서 서버로 이관(비로그인 스크랩 처리 방식도 같이 정할 것), 에디터 제보 승인 화면, 최종 배포(Vercel/Netlify + Render + Neon).
- 새 PC에서 세션 시작할 땐 `server/.env`뿐 아니라 **루트 `.env`도** git에 안 잡히니 `.env.example` 보고 새로 만들어야 함(`VITE_API_URL`, 로컬이면 보통 `http://localhost:4000`).
- STRATEGY.md에 남겨둔 작은 논리 틈(2-1의 AI 생성 소스 위계, 2-7의 타깃 불일치)은 급하지 않음 — 여유 있을 때 다듬을 것.
- 원본 소재 라이브러리(효과음·자료화면), 프리미엄/B2B 수익모델은 아직 어떤 화면/기능으로 구현할지 미정 — 백엔드 연동보다 후순위.

## 알려진 한계 (일부러 미룬 것)
- 밈 데이터 자체는 아직 프론트에서 `src/data/memes.js` 정적 import로 읽음 — DB엔 이관됐지만 프론트가 아직 API를 안 씀(다음 할 일 참고)
- 라우팅 라이브러리 없음 — URL 공유, 브라우저 뒤로가기 불가
- 스크랩/최근 본 밈은 여전히 브라우저별 localStorage에만 저장 — 기기·브라우저 간 동기화 안 됨(로그인 세션은 서버로 이전됨)

## 세션 마무리 체크리스트
- [ ] 이 파일의 "진행 중 / 다음에 할 일" 업데이트
- [ ] `git add` → `git commit` → `git push`
