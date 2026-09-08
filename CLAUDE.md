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
- 앱 전체가 [src/App.jsx](src/App.jsx) 한 파일에 들어있음: Mock 데이터, 유틸 함수, 작은 컴포넌트, 페이지 뷰(View), 최상위 App 컴포넌트까지 전부 포함.
- 라우팅 라이브러리 없이 `view` state 객체(`{ name: "home" | "search" | "detail" | "trend" | "dictionary" | "archive" | "auth" | "mypage", ...params }`)로 화면 전환. 브라우저 뒤로가기/URL 공유는 동작하지 않음.
- 로그인/회원가입은 실제 서버 없이 입력값으로 임시 세션(`user` state)만 생성하는 Mock.
- 스크랩(찜), 최근 본 밈은 컴포넌트 state로만 존재 — 새로고침하면 초기화됨(영속 저장소 없음).

## 디자인 컨벤션
- 흑백 모노톤, 얇은 border 기반 카드 UI (그림자·둥근 모서리 거의 안 씀)
- 폰트는 Noto Sans KR. `font-serif-kr` 클래스는 이름과 달리 실제로는 Noto Sans KR bold(굵은 고딕)를 적용함 — serif 폰트가 아니니 이름에 헷갈리지 말 것.
- 실제 통계·인물·영상 데이터가 아닌 섹션에는 `<MockTag />`로 "Mock Data" 표시를 붙임

## 데이터
- `MEMES` 배열이 유일한 데이터 소스 (`src/App.jsx` 상단). 실제 API 연동 전까지는 여기에 항목을 추가/수정.
- 랭킹은 `period`(daily/weekly/monthly/yearly)별로 `rank` 필드에 미리 정의됨. "직접 설정" 기간은 문자열 해시 기반 결정론적 의사난수로 즉석 생성(`customRankList`) — 실제 데이터 아님.

## 작업 시 참고
- 새 세션 시작 시 [docs/PROGRESS.md](docs/PROGRESS.md)도 함께 확인해서 진행 상황을 이어갈 것.
- 이 프로젝트는 PC방 등 여러 컴퓨터를 오가며 작업함 — 세션 종료 전 항상 git commit + push, 시작 시 git pull.
