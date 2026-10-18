# Windows PC(PC방) 작업 노트

2026-10-18까지 이 프로젝트는 PC방 등 여러 Windows PC를 오가며 작업했고, 그때 부딪힌 환경 문제와 우회법을 CLAUDE.md에 적어뒀었음. 이후 작업은 클라우드 Claude Code(리눅스 컨테이너)로 옮겨서 이 내용은 CLAUDE.md에서 빼고 여기로 옮김. **다시 Windows PC(특히 PC방)에서 작업하게 되면 이 문서를 먼저 볼 것.** 클라우드 세션에선 해당 없음.

## 환경 점검 흐름
- **환경 점검은 "정말 필요한 것만" 하고 검증용 절차를 늘리지 말 것(2026-09-14 피드백: 매번 시간 너무 오래 걸림).** 매번 다른 PC(PC방)라 `node_modules`/`.env`가 없는 게 정상이고 설치 자체는 매번 새로 해야 함 — 그건 못 줄임. 대신 아래 두 가지는 **항상 하지 말고, 실제로 문제가 생겼을 때만(반응적으로)** 할 것:
  - **손상 체크(lucide-react 파일 개수, `@tailwindcss/oxide` 네이티브 바이너리 등)를 설치 끝날 때마다 미리 해보지 말 것.** 이건 가끔 생기는 문제지 매번 생기는 게 아님 — `npm install`이 끝나면 바로 build/lint 한 번만 돌려보고, 거기서 진짜로 이상한 모듈 해석 에러가 나올 때만 그때 가서 해당 패키지를 의심하고 재설치할 것.
  - **dev 서버·백엔드 서버를 띄워서 curl로 확인하고 다시 끄는 절차를 환경 점검에 기본으로 넣지 말 것.** build 성공 + lint 클린이면 환경 자체는 검증된 것 — 서버를 실제로 띄워서 보여주는 건 사용자가 그걸 원할 때만 별도로 할 것.
  결국 환경 점검의 기본 흐름은: node 확인 → git identity 확인/수정 → `.env` 없으면 템플릿에서 생성 → `npm install`(서버는 `--ignore-scripts`) → `prisma generate` → Vite `net use` 패치 적용(이건 PC방 네트워크에서 100% 재현되는 문제라 예방적으로 바로 할 것) → build/lint 한 번. 여기서 끝 — 추가 검증은 안 함.
- **PC마다 node.js가 아예 설치되어 있지 않을 수 있음** (PC방 컴퓨터가 특히 그럼). PATH 문제가 아니라 진짜 미설치인지 먼저 확인할 것(`node -v`). 설치돼 있어도 방금 설치했다면 VS Code(정확히는 Claude Code 확장을 호스팅하는 프로세스)를 재시작해야 새 PATH가 반영됨 — 재시작 전에는 설치했는데도 `command not found`가 뜰 수 있음.
- **진짜 새 PC는 git 사용자 정보(`user.name`/`user.email`)도 아예 설정 안 돼 있어서 첫 커밋 시도에서 "Author identity unknown" 에러가 남(2026-09-13 확인).** `git log --format='%an <%ae>'`로 기존 커밋 작성자를 확인해서 `git config user.name "109kim"` / `git config user.email "27174298leo@gmail.com"`로 (레포 로컬에만, `--global` 없이) 맞춰줄 것.
- 루트 `.env`, `server/.env`는 git에 안 잡히니 PC 바뀔 때마다 `.env.example`을 보고 새로 만들 것.

## cmd.exe 스폰 차단 (PC방)
- **PC방 컴퓨터는 `cmd.exe`/`powershell.exe` 프로세스 스폰 자체를 정책상 막아놓음 — Claude 도구뿐 아니라 사용자가 직접 여는 git bash에서도 재현됨(확인됨: 2026-09-10).** `npm run dev`/`npm run build`/`npm run lint`는 Windows에서 npm이 내부적으로 `cmd.exe /d /s /c "..."`로 스크립트를 실행하는데, 이 스폰이 막히면서 `> vite` 같은 배너 줄만 찍히고 그 이후 아무 반응 없이 조용히 멈춘다(에러 메시지 없이 그냥 멈추거나 exit 127).
  - **따라서 `npm run <script>` 대신 항상 실제 바이너리를 직접 호출할 것** — Claude가 검증할 때뿐 아니라 사용자에게 실행을 안내할 때도 마찬가지:
    - 개발 서버: `node node_modules/vite/bin/vite.js`
    - 빌드: `node node_modules/vite/bin/vite.js build`
    - 린트: `node_modules/oxlint/bin/oxlint` (`.bin`의 `.cmd`/`.ps1` shim이 아니라 실제 바이너리 경로)
    - 백엔드(`server/`에서): `node src/index.js`, `node node_modules/prisma/build/index.js generate`, `node prisma/seed.js`
  - `child_process.exec`/`execSync`처럼 내부적으로 cmd.exe를 거치는 호출만 막히고, `execFile`/`spawn`으로 바이너리를 직접 실행하는 건 정상 동작함(node.exe, bash.exe, git.exe 등). `npm install` 자체는 프론트엔드 의존성(install/postinstall 스크립트 없음)에 한해서는 cmd.exe를 안 거치므로 문제없이 된다.
  - **단, `npm install`도 무조건 안전한 건 아님(2026-09-11, `server/` 추가하면서 확인)** — 설치하려는 패키지 중 `postinstall` 등 라이프사이클 스크립트가 있는 경우(예: `prisma`), npm이 그 스크립트를 실행하려고 내부적으로 cmd.exe를 스폰하면서 똑같이 막힘 → `npm error errno: -4048, code: 'EPERM', syscall: 'spawn'`로 설치 자체가 실패한다. 대응: `npm install --ignore-scripts`로 설치한 뒤, 필요한 스크립트(예: `prisma generate`)는 `node node_modules/prisma/build/index.js generate`처럼 실제 바이너리를 직접 호출해서 수동으로 실행할 것. `npx <cli>`도 같은 방식이라 막힐 수 있으니 `npx` 대신 `node node_modules/<pkg>/<entry>` 직접 호출을 우선 시도할 것.
  - Vite 8.2.2는 추가로 Windows 설정 로딩 시 내부적으로 `exec("net use")`를 호출(`node_modules/vite/dist/node/chunks/node.js`의 `optimizeSafeRealPathSync`)하는데 이것도 cmd.exe라서 막힌다. 콜백에 에러가 전달되는 게 아니라 `exec()` 호출 자체가 동기적으로 `spawn EPERM`을 던지는 걸로 확인됨(2026-09-13) — 그 `exec(...)` 호출을 `try { ... } catch { safeRealpathSync = fs.realpathSync.native; }`로 감싸면 우회되지만(네트워크 드라이브 판별만 건너뜀, 로컬 드라이브엔 영향 없음), `node_modules`는 git에 안 잡히므로 `npm install`을 다시 하면 사라지는 임시 조치임 — 필요할 때마다 다시 적용.
- **서버(`node src/index.js`)가 떠 있는 상태에서 `prisma generate`를 실행하면 엔진 파일이 잠겨서 `EPERM: rename ... query_engine-windows.dll.node` 에러가 남** — 먼저 그 서버 프로세스를 종료(`tasklist`/`taskkill //F //PID <pid>`)하고 다시 실행할 것.

## 손상된 채로 설치되는 패키지 (PC방 네트워크)
- **이 네트워크는 `npm install` 자체가 성공(exit 0)해도 일부 패키지 파일이 손상되거나 누락된 채로 받아질 수 있음(2026-09-13 발견, 원인은 불명 — 아마 네트워크 불안정으로 인한 부분 다운로드).** 실제로 두 번 재현됨: (1) `@tailwindcss/oxide-win32-x64-msvc`의 네이티브 바이너리(`.node` 파일)가 손상됨("stream did not contain valid UTF-8" 에러로 나타남), (2) `lucide-react`가 아이콘 파일 대부분이 빠진 채 설치됨(`index.mjs`를 포함한 다수가 없어서 빌드 시 `[UNRESOLVED_IMPORT]` 에러). 빌드/린트가 이상한 모듈 해석 에러를 내면 먼저 해당 패키지(또는 전체 `node_modules` + `package-lock.json`)를 지우고 재설치해볼 것 — 재설치로 두 번 다 해결됨.

## Postgres 5432 포트 차단 (PC방 네트워크)
- **PC방 네트워크는 Postgres 기본 포트(5432) 아웃바운드 자체를 막아놓음(확인됨: 2026-09-11).** 443(HTTPS)은 정상 연결됨. 그래서 `DATABASE_URL`이 정확해도 `prisma migrate`/일반 TCP 기반 Postgres 클라이언트는 전부 `P1001: Can't reach database server`로 타임아웃남 — Neon 프로젝트나 연결 문자열 문제가 아니라 네트워크 정책 문제였음. 대응으로 서버(`server/`)는 **Neon의 HTTP/WebSocket 기반 드라이버(`@neondatabase/serverless` + `@prisma/adapter-neon`)로 접속**하도록 만들어둠 — 443만 쓰므로 어디서든 동작함. 마이그레이션도 같은 이유로 `migrate dev/deploy` 대신 수동 SQL + `apply-migration.js` 방식을 씀(절차는 CLAUDE.md "DB 스키마 변경" 참고).
