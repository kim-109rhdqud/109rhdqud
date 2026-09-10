# 유행도감 (Trend Encyclopedia)

요즘 유행하는 밈·유행어·상품·인물·챌린지를 검색하고 둘러볼 수 있는 React 웹앱. 현재는 프로토타입 단계로, 모든 데이터가 Mock Data임.

## 기술 스택
- React 19 + Vite
- Tailwind CSS 4 (`@tailwindcss/vite` 플러그인)
- lucide-react (아이콘)
- oxlint (린트, TypeScript 아님 — 순수 JSX)

## 실행 명령어
- `npm run dev` — 개발 서버
- `npm run build` — 프로덕션 빌드
- `npm run lint` — oxlint 실행
- `npm run preview` — 빌드 결과 미리보기

## 현재 아키텍처
- [src/App.jsx](src/App.jsx)는 얇은 셸(shell)만 담당 — `useAppState` 훅으로 상태를 받아 NavBar와 현재 view에 맞는 페이지를 렌더링.
- `src/data/` — `memes.js`(MEMES, CATEGORIES, memeById), `rank.js`(기간별 랭킹 계산)
- `src/lib/storage.js` — localStorage 안전 read/write 래퍼
- `src/hooks/useAppState.js` — view/user/scraps/recentlyViewed 상태 + localStorage 영속화
- `src/components/` — 여러 페이지에서 재사용되는 작은 UI 조각(Logo, NavBar, SearchBar, MemeCard, CategoryTag, MockTag, RankChange, MetricBar, Sparkline, SectionHeading, PillTabs 등)
- `src/pages/` — 화면 단위 뷰 컴포넌트 (HomeView, SearchResultsView, DetailView, TrendView, DictionaryView, ArchiveView, AuthView, MyPageView, ScrapsView)
- 라우팅 라이브러리 없이 `view` state 객체(`{ name: "home" | "search" | "detail" | "trend" | "dictionary" | "archive" | "auth" | "mypage" | "scraps", ...params }`)로 화면 전환. 브라우저 뒤로가기/URL 공유는 동작하지 않음.
- 로그인/회원가입은 실제 서버 없이 입력값으로 임시 세션(`user` state)만 생성하는 Mock.
- 스크랩(찜), 최근 본 밈, 로그인 세션은 `localStorage`에 영속화됨(새로고침해도 유지). 단, 여러 브라우저/기기 간 동기화는 안 됨 — 여전히 로컬 저장일 뿐.

## 디자인 컨벤션
- 흑백 모노톤, 얇은 border 기반 카드 UI (그림자·둥근 모서리 거의 안 씀)
- 폰트는 Noto Sans KR. `font-serif-kr` 클래스는 이름과 달리 실제로는 Noto Sans KR bold(굵은 고딕)를 적용함 — serif 폰트가 아니니 이름에 헷갈리지 말 것.
- 실제 통계·인물·영상 데이터가 아닌 섹션에는 `<MockTag />`로 "Mock Data" 표시를 붙임

## 데이터
- `MEMES` 배열이 유일한 데이터 소스 (`src/data/memes.js`). 실제 API 연동 전까지는 여기에 항목을 추가/수정.
- 랭킹은 `period`(daily/weekly/monthly/yearly)별로 `rank` 필드에 미리 정의됨. "직접 설정" 기간은 문자열 해시 기반 결정론적 의사난수로 즉석 생성(`customRankList`) — 실제 데이터 아님.

## 작업 시 참고
- 새 세션 시작 시 [docs/PROGRESS.md](docs/PROGRESS.md)도 함께 확인해서 진행 상황을 이어갈 것.
- [docs/SPEC.md](docs/SPEC.md)에 이 프로젝트의 원본 기획서(초기 제작 프롬프트) 전문이 보존되어 있음. 기능/디자인 방향에 대해 판단이 필요할 때 참고할 것. 단, TypeScript 관련 항목(18번)처럼 의도적으로 벗어난 부분도 있으니 SPEC.md 상단의 "알려진 의도적 이탈 사항"을 먼저 확인할 것.
- 이 프로젝트는 PC방 등 여러 컴퓨터를 오가며 작업함 — 세션 종료 전 항상 git commit + push, 시작 시 git pull.
- **PC마다 node.js가 아예 설치되어 있지 않을 수 있음** (PC방 컴퓨터가 특히 그럼). PATH 문제가 아니라 진짜 미설치인지 먼저 확인할 것(`node -v`). 설치돼 있어도 방금 설치했다면 VS Code(정확히는 Claude Code 확장을 호스팅하는 프로세스)를 재시작해야 새 PATH가 반영됨 — 재시작 전에는 설치했는데도 `command not found`가 뜰 수 있음.
- **이 PC방 컴퓨터는 `cmd.exe`/`powershell.exe` 프로세스 스폰 자체를 정책상 막아놓음 — Claude 도구뿐 아니라 사용자가 직접 여는 git bash에서도 재현됨(확인됨: 2026-09-10).** `npm run dev`/`npm run build`/`npm run lint`는 Windows에서 npm이 내부적으로 `cmd.exe /d /s /c "..."`로 스크립트를 실행하는데, 이 스폰이 막히면서 `> vite` 같은 배너 줄만 찍히고 그 이후 아무 반응 없이 조용히 멈춘다(사용자 bash에서도, Claude의 Bash 도구에서도 동일 증상: 에러 메시지 없이 그냥 멈추거나 exit 127).
  - **따라서 `npm run <script>` 대신 항상 실제 바이너리를 직접 호출할 것** — 이건 Claude 자신이 검증할 때뿐 아니라 사용자에게 실행을 안내할 때도 마찬가지임:
    - 개발 서버: `node node_modules/vite/bin/vite.js`
    - 빌드: `node node_modules/vite/bin/vite.js build`
    - 린트: `node_modules/oxlint/bin/oxlint` (`.bin`의 `.cmd`/`.ps1` shim이 아니라 실제 바이너리 경로)
  - `child_process.exec`/`execSync`처럼 내부적으로 cmd.exe를 거치는 호출만 막히고, `execFile`/`spawn`으로 바이너리를 직접 실행하는 건 정상 동작함(node.exe, bash.exe, git.exe 등). `npm install` 자체는 cmd.exe를 안 거치므로 문제없이 된다.
  - Vite 8.2.2는 추가로 Windows 설정 로딩 시 내부적으로 `exec("net use")`를 호출(`node_modules/vite/dist/node/chunks/node.js`의 `optimizeSafeRealPathSync`)하는데 이것도 cmd.exe라서 막힌다. 그 `exec(...)` 호출을 `try { ... } catch { safeRealpathSync = fs.realpathSync.native; }`로 감싸면 우회되지만(네트워크 드라이브 판별만 건너뜀, 로컬 드라이브엔 영향 없음), `node_modules`는 git에 안 잡히므로 `npm install`을 다시 하면 사라지는 임시 조치임 — 필요할 때마다 다시 적용.
