import { useState, useMemo } from "react";
import { Search, Heart, User, TrendingUp, ChevronRight, ChevronDown, Play, X, ArrowUp, ArrowDown, LogOut } from "lucide-react";

/* ============================== MOCK DATA ============================== */
/* 이 파일의 모든 수치·인물·영상 정보는 프로토타입 데모용 Mock Data이며 실제 사실이 아니다. */

const CATEGORIES = ["밈", "유행어", "상품", "인물", "챌린지", "영상", "기타"];

const MEMES = [
  {
    id: "ddujjonkku",
    name: "두쫀쿠",
    categories: ["상품", "밈"],
    oneLiner: "쫀득한 식감을 강조하며 SNS에서 화제가 된 디저트 신조어이자 상품명",
    whatIsIt:
      "두쫀쿠는 원래 한 디저트 브랜드가 내놓은 쿠키의 별명에서 시작된 말이야. 씹을 때 '두 배로 쫀득하다'는 뜻을 담고 있는데, 지금은 디저트뿐 아니라 쫀득하고 만족스러운 무언가를 가리키는 표현으로 넓게 쓰이고 있어.",
    whyPopular:
      "짧은 영상 콘텐츠에서 쿠키를 늘려가며 식감을 보여주는 장면이 반복 재생되면서 확산됐어. 발음이 재밌고 리듬감이 있어서 따라 하기 쉬웠던 것도 확산 속도를 높인 요인으로 보여.",
    howToUse:
      "\"이거 완전 두쫀쿠인데?\"처럼 식감이나 만족감을 강조할 때, 또는 실제 그 디저트 자체를 지칭할 때 사용해.",
    oneLineSummary: "쫀득함을 강조하는 요즘 표현, 원래는 디저트 이름이었다.",
    platforms: ["인스타그램", "틱톡"],
    period: "2025.02 ~ 진행중",
    popularity: { buzz: 82, search: 91, usage: 74 },
    keywords: ["디저트", "쫀득", "신조어", "SNS유행"],
    relatedMemeIds: ["yareu", "moodeungtumbler"],
    relatedPeople: [
      { name: "크리에이터 다현", reason: "숏폼 영상에서 처음 언급하며 확산의 시작점이 됨", content: "쿠키 리뷰 영상 (2025.02)" },
    ],
    relatedVideos: [
      { title: "두쫀쿠가 대체 뭐길래?", channel: "다현이네" },
      { title: "두쫀쿠 직접 만들어봄", channel: "맛있는하루" },
    ],
    timeline: [
      { date: "2025.02", text: "디저트 브랜드 신제품 별명으로 처음 등장" },
      { date: "2025.03", text: "숏폼 콘텐츠에서 확산 시작" },
      { date: "2025.04", text: "크리에이터 다현 언급 이후 화제성 급증" },
      { date: "2025.05", text: "일상 표현으로 의미 확장, 대중적으로 사용" },
    ],
    rank: {
      daily: { r: 1, ch: 3 }, weekly: { r: 1, ch: 1 }, monthly: { r: 1, ch: 2 }, yearly: { r: 2, ch: 0 },
    },
    registeredAt: "2025-02-20",
  },
  {
    id: "yareu",
    name: "야르",
    categories: ["유행어"],
    oneLiner: "가볍게 놀라거나 감탄할 때 쓰는 짧은 감탄사형 유행어",
    whatIsIt:
      "'야, 이거 뭐야?'가 줄어든 형태로 알려진 감탄사야. 놀라움과 재미가 섞인 반응을 짧게 표현할 때 쓰여.",
    whyPopular:
      "라이브 스트리밍 중 진행자가 자주 사용하면서 시청자들 사이에서 밈처럼 번졌고, 짧고 발음하기 쉬운 특성 덕분에 댓글창에서도 빠르게 확산됐어.",
    howToUse: "예상 못한 일이 생겼을 때 댓글이나 채팅에 단독으로 남기는 식으로 사용해.",
    oneLineSummary: "짧게 놀라움을 표현하는 인터넷 감탄사.",
    platforms: ["트위치", "유튜브 라이브"],
    period: "2025.03 ~ 진행중",
    popularity: { buzz: 76, search: 68, usage: 80 },
    keywords: ["감탄사", "스트리밍", "채팅밈"],
    relatedMemeIds: ["kingbatne"],
    relatedPeople: [{ name: "스트리머 하늘", reason: "방송 중 반복 사용하며 시청자들에게 확산", content: "라이브 방송 다시보기 클립" }],
    relatedVideos: [{ title: "야르 어디서 시작됐나 정리", channel: "밈정리소" }],
    timeline: [
      { date: "2025.03", text: "스트리밍 채팅창에서 처음 포착" },
      { date: "2025.04", text: "짧은 클립으로 재편집되며 확산" },
    ],
    rank: { daily: { r: 2, ch: null, isNew: true }, weekly: { r: 3, ch: -1 }, monthly: { r: 4, ch: 1 }, yearly: { r: 5, ch: 2 } },
    registeredAt: "2025-03-10",
  },
  {
    id: "kingbatne",
    name: "킹받네",
    categories: ["유행어"],
    oneLiner: "화가 나거나 어이없을 때 쓰는 접두사 '킹'이 붙은 유행어",
    whatIsIt: "'너무 열받는다'를 강조해서 표현한 말로, '킹'을 붙여 감정의 크기를 과장하는 말버릇 중 하나야.",
    whyPopular: "예능·게임 콘텐츠의 리액션 편집에서 자막으로 자주 쓰이며 굳어졌어.",
    howToUse: "황당하거나 어처구니없는 상황에 반응할 때 사용해.",
    oneLineSummary: "황당함·분노를 과장해서 표현하는 말.",
    platforms: ["유튜브", "커뮤니티"],
    period: "2024.11 ~ 진행중",
    popularity: { buzz: 70, search: 60, usage: 85 },
    keywords: ["감정표현", "예능", "자막밈"],
    relatedMemeIds: ["yareu"],
    relatedPeople: [],
    relatedVideos: [{ title: "요즘 애들이 쓰는 '킹받네' 뜻", channel: "요즘말사전" }],
    timeline: [
      { date: "2024.11", text: "게임 방송 리액션 자막에서 등장" },
      { date: "2025.01", text: "예능 자막으로 확산" },
    ],
    rank: { daily: { r: 3, ch: -1 }, weekly: { r: 2, ch: 2 }, monthly: { r: 2, ch: 0 }, yearly: { r: 1, ch: 0 } },
    registeredAt: "2024-11-15",
  },
  {
    id: "aljaldakkkalsen",
    name: "알잘딱깔센",
    categories: ["유행어"],
    oneLiner: "'알아서 잘 딱 깔끔하고 센스있게'를 줄인 만능 칭찬형 유행어",
    whatIsIt: "여러 단어를 줄여 만든 신조어로, 일 처리나 결과물이 훌륭할 때 쓰는 칭찬 표현이야.",
    whyPopular: "줄임말 자체의 리듬감과 '만능 칭찬'이라는 실용성 덕분에 다양한 맥락에서 두루 쓰이며 퍼졌어.",
    howToUse: "누군가 일을 센스있게 잘 처리했을 때 칭찬으로 사용해.",
    oneLineSummary: "센스있고 깔끔한 일 처리를 칭찬하는 줄임말.",
    platforms: ["커뮤니티", "인스타그램"],
    period: "2023.09 ~ 진행중",
    popularity: { buzz: 55, search: 50, usage: 66 },
    keywords: ["줄임말", "칭찬", "신조어"],
    relatedMemeIds: ["owunwan"],
    relatedPeople: [],
    relatedVideos: [],
    timeline: [
      { date: "2023.09", text: "커뮤니티 게시글 제목으로 처음 등장" },
      { date: "2024.02", text: "일상 대화 표현으로 정착" },
    ],
    rank: { daily: { r: 4, ch: 0 }, weekly: { r: 4, ch: 0 }, monthly: { r: 5, ch: -1 }, yearly: { r: 3, ch: -1 } },
    registeredAt: "2023-09-05",
  },
  {
    id: "owunwan",
    name: "오운완",
    categories: ["유행어"],
    oneLiner: "'오늘 운동 완료'를 줄인, 운동 인증 게시물에 쓰는 유행어",
    whatIsIt: "운동을 마쳤다는 뜻의 줄임말로, SNS 운동 인증 게시글의 해시태그로 자리잡았어.",
    whyPopular: "건강·자기관리 콘텐츠 열풍과 함께 인증 문화가 퍼지면서 대표 해시태그가 됐어.",
    howToUse: "운동을 마친 뒤 인증 사진과 함께 게시글이나 해시태그로 사용해.",
    oneLineSummary: "운동 인증 게시물에 쓰는 '오늘 운동 완료' 줄임말.",
    platforms: ["인스타그램"],
    period: "2022.06 ~ 진행중",
    popularity: { buzz: 60, search: 72, usage: 70 },
    keywords: ["운동", "해시태그", "자기관리"],
    relatedMemeIds: ["aljaldakkkalsen"],
    relatedPeople: [],
    relatedVideos: [{ title: "오운완 챌린지 100일 후기", channel: "헬시라이프" }],
    timeline: [{ date: "2022.06", text: "피트니스 인플루언서들 사이에서 해시태그로 시작" }],
    rank: { daily: { r: 5, ch: 2 }, weekly: { r: 5, ch: null, isNew: true }, monthly: { r: 6, ch: 1 }, yearly: { r: 4, ch: 1 } },
    registeredAt: "2022-06-01",
  },
  {
    id: "mumul",
    name: "무물",
    categories: ["유행어", "챌린지"],
    oneLiner: "'무엇이든 물어보세요'를 줄인, 소통형 콘텐츠 형식",
    whatIsIt: "팔로워들의 질문을 받아 답하는 콘텐츠 형식이자 그 줄임말이야.",
    whyPopular: "인플루언서와 팬 사이의 직접 소통 창구로 자리잡으며 꾸준히 쓰이고 있어.",
    howToUse: "\"무물 받습니다\"처럼 질문을 받겠다는 의사표시로 사용해.",
    oneLineSummary: "질문을 받아 답하는 소통 콘텐츠 줄임말.",
    platforms: ["인스타그램 스토리", "트위터"],
    period: "2021.01 ~ 진행중",
    popularity: { buzz: 40, search: 45, usage: 58 },
    keywords: ["소통", "Q&A", "인스타스토리"],
    relatedMemeIds: [],
    relatedPeople: [],
    relatedVideos: [],
    timeline: [{ date: "2021.01", text: "인스타그램 스토리 질문 기능과 함께 용어로 정착" }],
    rank: { daily: { r: 6, ch: -2 }, weekly: { r: 6, ch: -2 }, monthly: { r: 7, ch: -1 }, yearly: { r: 6, ch: -1 } },
    registeredAt: "2021-01-10",
  },
  {
    id: "dangdangi-challenge",
    name: "댕댕이 미소 챌린지",
    categories: ["챌린지"],
    oneLiner: "반려견이 웃는 듯한 표정을 포착해 공유하는 숏폼 챌린지",
    whatIsIt: "반려견의 자연스러운 '미소' 순간을 촬영해 올리는 참여형 챌린지야.",
    whyPopular: "귀여운 반려동물 콘텐츠에 대한 꾸준한 수요와 참여 장벽이 낮다는 점이 확산을 이끌었어.",
    howToUse: "해시태그와 함께 반려견 영상을 올리며 챌린지에 참여해.",
    oneLineSummary: "반려견 미소 순간을 공유하는 참여형 챌린지.",
    platforms: ["틱톡", "인스타그램 릴스"],
    period: "2025.05 ~ 진행중",
    popularity: { buzz: 65, search: 58, usage: 50 },
    keywords: ["반려동물", "챌린지", "숏폼"],
    relatedMemeIds: ["ddukiya"],
    relatedPeople: [],
    relatedVideos: [{ title: "댕댕이 미소 챌린지 모음", channel: "펫스타그램" }],
    timeline: [{ date: "2025.05", text: "개인 계정에서 시작해 해시태그 챌린지로 확산" }],
    rank: { daily: { r: 7, ch: null, isNew: true }, weekly: { r: 7, ch: 1 }, monthly: { r: 8, ch: 2 }, yearly: { r: 8, ch: null, isNew: true } },
    registeredAt: "2025-05-18",
  },
  {
    id: "moodeungtumbler",
    name: "말랑템 텀블러",
    categories: ["상품"],
    oneLiner: "말랑한 촉감의 실리콘 마감이 특징인 유행 텀블러",
    whatIsIt: "표면이 말랑말랑한 실리콘으로 마감된 텀블러 상품군을 가리키는 말이야.",
    whyPopular: "손에 쥐는 촉감을 강조한 언박싱·리뷰 콘텐츠가 늘어나며 구매 관심으로 이어졌어.",
    howToUse: "제품을 지칭하거나 관련 리뷰·추천 콘텐츠에서 사용해.",
    oneLineSummary: "말랑한 촉감이 특징인 요즘 유행 텀블러.",
    platforms: ["틱톡", "쇼핑 플랫폼"],
    period: "2025.04 ~ 진행중",
    popularity: { buzz: 58, search: 63, usage: 40 },
    keywords: ["텀블러", "리뷰", "소비트렌드"],
    relatedMemeIds: ["ddujjonkku"],
    relatedPeople: [],
    relatedVideos: [{ title: "말랑템 텀블러 실사용 리뷰", channel: "데일리굿즈" }],
    timeline: [{ date: "2025.04", text: "리뷰 콘텐츠를 통해 상품명이 알려지기 시작" }],
    rank: { daily: { r: 8, ch: -1 }, weekly: { r: 8, ch: -1 }, monthly: { r: 9, ch: -2 }, yearly: { r: 7, ch: -2 } },
    registeredAt: "2025-04-22",
  },
  {
    id: "ddukiya",
    name: "부덕이",
    categories: ["밈", "인물"],
    oneLiner: "짧은 애니메이션 클립에서 파생된 무표정 캐릭터 밈",
    whatIsIt: "무표정한 얼굴과 엉뚱한 반응으로 화제가 된 가상 캐릭터야. 실존 인물이 아니라 콘텐츠 속 캐릭터에서 시작됐어.",
    whyPopular: "감정을 과장하지 않는 무표정 리액션이 다양한 상황에 합성하기 좋아 밈으로 재생산됐어.",
    howToUse: "황당하거나 무덤덤한 반응을 표현하고 싶을 때 이미지·짤로 사용해.",
    oneLineSummary: "무표정 리액션으로 유명한 가상 캐릭터 밈.",
    platforms: ["커뮤니티", "트위터"],
    period: "2025.01 ~ 진행중",
    popularity: { buzz: 48, search: 40, usage: 55 },
    keywords: ["캐릭터", "리액션짤", "가상캐릭터"],
    relatedMemeIds: ["dangdangi-challenge"],
    relatedPeople: [],
    relatedVideos: [],
    timeline: [{ date: "2025.01", text: "단편 애니메이션 클립에서 캐릭터 등장" }, { date: "2025.02", text: "리액션 짤로 재가공되며 확산" }],
    rank: { daily: { r: 9, ch: 0 }, weekly: { r: 9, ch: null, isNew: true }, monthly: { r: 10, ch: null, isNew: true }, yearly: { r: 9, ch: null, isNew: true } },
    registeredAt: "2025-01-25",
  },
];

const memeById = (id) => MEMES.find((m) => m.id === id);

function rankList(period) {
  return MEMES
    .filter((m) => m.rank[period])
    .map((m) => ({ meme: m, ...m.rank[period], search: m.popularity.search, buzz: m.popularity.buzz }))
    .sort((a, b) => a.r - b.r);
}

/* 사용자가 직접 고른 기간의 순위는 실제 데이터가 없으므로, 기간 문자열을 시드로 한
   결정론적 의사난수로 검색량·화제성을 만들어 보여준다 (Mock Data). */
function hashSeed(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}
function seededValue(seed, min, max) {
  return min + (hashSeed(seed) % (max - min + 1));
}
function customRankList(start, end) {
  const rows = MEMES.map((m) => {
    const search = seededValue(`${m.id}-search-${start}-${end}`, 30, 99);
    const buzz = seededValue(`${m.id}-buzz-${start}-${end}`, 20, 95);
    const prevSearch = seededValue(`${m.id}-search-prev-${start}-${end}`, 30, 99);
    const prevBuzz = seededValue(`${m.id}-buzz-prev-${start}-${end}`, 20, 95);
    return { meme: m, search, buzz, score: search + buzz, prevScore: prevSearch + prevBuzz };
  });
  const sorted = [...rows].sort((a, b) => b.score - a.score).map((row, i) => ({ ...row, r: i + 1 }));
  const prevOrder = [...rows].sort((a, b) => b.prevScore - a.prevScore).map((row, i) => ({ id: row.meme.id, r: i + 1 }));
  return sorted.map((row) => {
    const prevRank = prevOrder.find((p) => p.id === row.meme.id)?.r ?? row.r;
    return { ...row, ch: prevRank - row.r, isNew: false };
  });
}
function unifiedRankList(period, customStart, customEnd) {
  if (period === "custom") {
    if (!customStart || !customEnd) return [];
    return customRankList(customStart, customEnd);
  }
  return rankList(period);
}

/* ============================== 작은 컴포넌트 ============================== */

function Logo({ onClick }) {
  return (
    <button onClick={onClick} className="font-serif-kr text-xl tracking-tight text-black">
      유행도감
    </button>
  );
}

function CategoryTag({ children }) {
  return (
    <span className="inline-block border border-gray-400 px-2 py-0.5 text-xs text-gray-700">
      {children}
    </span>
  );
}

function MockTag() {
  return (
    <span className="inline-block border border-gray-300 bg-gray-50 px-2 py-0.5 text-[11px] text-gray-500">
      Mock Data
    </span>
  );
}

function RankChange({ ch, isNew }) {
  if (isNew) return <span className="text-xs border border-black px-1">NEW</span>;
  if (ch === 0 || ch === null || ch === undefined) return <span className="text-xs text-gray-400">－</span>;
  if (ch > 0)
    return (
      <span className="inline-flex items-center gap-0.5 text-xs text-black">
        <ArrowUp size={12} strokeWidth={2.5} /> {ch}
      </span>
    );
  return (
    <span className="inline-flex items-center gap-0.5 text-xs text-gray-500">
      <ArrowDown size={12} strokeWidth={2.5} /> {Math.abs(ch)}
    </span>
  );
}

function MetricBar({ label, value }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-sm text-gray-700">{label}</span>
        <span className="font-serif-kr text-sm text-black">{value}</span>
      </div>
      <div className="h-2 w-full bg-gray-100">
        <div className="h-2 bg-black" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function MemeCard({ meme, onOpen }) {
  return (
    <button
      onClick={() => onOpen(meme.id)}
      className="text-left border border-gray-200 p-4 hover:border-black transition-colors w-full"
    >
      <div className="flex flex-wrap gap-1 mb-2">
        {meme.categories.map((c) => (
          <CategoryTag key={c}>{c}</CategoryTag>
        ))}
      </div>
      <h3 className="font-serif-kr text-lg mb-1 text-black">{meme.name}</h3>
      <p className="text-sm text-gray-600 leading-relaxed mb-2 line-clamp-2">{meme.oneLiner}</p>
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{meme.period}</span>
        <span>화제성 {meme.popularity.buzz}</span>
      </div>
    </button>
  );
}

/* ============================== 검색창 ============================== */

function SearchBar({ initialValue = "", onSearch, size = "large" }) {
  const [value, setValue] = useState(initialValue);
  const [focused, setFocused] = useState(false);

  const suggestions = useMemo(() => {
    const q = value.trim();
    if (!q) return [];
    const matched = MEMES.filter((m) => m.name.includes(q)).slice(0, 3);
    const out = [];
    matched.forEach((m) => {
      out.push(m.name, `${m.name} 유래`, `${m.name} 관련 영상`);
    });
    return out.slice(0, 6);
  }, [value]);

  const submit = (q) => {
    const query = (q ?? value).trim();
    if (!query) return;
    setFocused(false);
    onSearch(query);
  };

  const isLarge = size === "large";

  return (
    <div className="relative w-full">
      <div className={`flex items-center border border-black ${isLarge ? "px-5 py-4" : "px-3 py-2"}`}>
        <Search size={isLarge ? 22 : 16} className="text-black shrink-0" />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 120)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="밈, 유행어, 상품을 검색해봐 · 예: 두쫀쿠, 야르, 킹받네"
          className={`w-full outline-none px-3 ${isLarge ? "text-lg" : "text-sm"} font-sans-kr placeholder:text-gray-400`}
        />
        {value && (
          <button onClick={() => setValue("")} className="text-gray-400 hover:text-black shrink-0">
            <X size={16} />
          </button>
        )}
      </div>
      {focused && suggestions.length > 0 && (
        <div className="absolute z-20 left-0 right-0 bg-white border border-t-0 border-black">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onMouseDown={() => submit(s)}
              className="w-full text-left px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100 last:border-0"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================== 네비게이션 ============================== */

function NavBar({ view, setView, user, onLogout }) {
  const [navSearch, setNavSearch] = useState(false);
  const NavItem = ({ target, children }) => (
    <button
      onClick={() => setView({ name: target })}
      className={`text-sm px-1 py-1 border-b-2 ${
        view.name === target ? "border-black text-black" : "border-transparent text-gray-500 hover:text-black"
      }`}
    >
      {children}
    </button>
  );

  return (
    <header className="border-b border-black sticky top-0 bg-white z-30">
      <div className="max-w-5xl mx-auto px-5 py-3 flex items-center gap-6">
        <Logo onClick={() => setView({ name: "home" })} />
        <nav className="flex items-center gap-5 flex-1">
          <NavItem target="home">홈</NavItem>
          <NavItem target="trend">트렌드</NavItem>
          <NavItem target="dictionary">밈 사전</NavItem>
          <NavItem target="archive">역사</NavItem>
          <button
            onClick={() => setNavSearch((v) => !v)}
            className="text-sm px-1 py-1 text-gray-500 hover:text-black flex items-center gap-1"
          >
            <Search size={14} /> 검색
          </button>
        </nav>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setView({ name: "mypage", tab: "scraps" })}
            className="text-sm text-gray-500 hover:text-black flex items-center gap-1"
          >
            <Heart size={14} /> 스크랩
          </button>
          {user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setView({ name: "mypage", tab: "overview" })}
                className="w-7 h-7 rounded-full bg-black text-white text-xs flex items-center justify-center"
                title={user.nickname}
              >
                {user.nickname.slice(0, 1)}
              </button>
              <button onClick={onLogout} className="text-gray-400 hover:text-black" title="로그아웃">
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setView({ name: "auth" })}
              className="text-sm border border-black px-3 py-1 hover:bg-black hover:text-white transition-colors"
            >
              로그인
            </button>
          )}
        </div>
      </div>
      {navSearch && (
        <div className="max-w-5xl mx-auto px-5 pb-3">
          <SearchBar
            size="small"
            onSearch={(q) => {
              setNavSearch(false);
              setView({ name: "search", query: q });
            }}
          />
        </div>
      )}
    </header>
  );
}

/* ============================== 홈 ============================== */

function HomeView({ setView }) {
  const [period, setPeriod] = useState("daily");
  const periods = [
    { key: "daily", label: "일간" },
    { key: "weekly", label: "주간" },
    { key: "yearly", label: "연간" },
  ];
  const list = rankList(period).slice(0, 5);

  return (
    <div className="max-w-3xl mx-auto px-5">
      <section className="pt-20 pb-14 text-center">
        <h1 className="font-serif-kr text-black leading-tight">
          <span className="block text-3xl md:text-4xl">이게 무슨 밈이지?</span>
          <span className="block text-3xl md:text-4xl mt-1">요즘 이건 왜 유행해?</span>
        </h1>
        <div className="mt-10 max-w-xl mx-auto">
          <SearchBar onSearch={(q) => setView({ name: "search", query: q })} />
        </div>
        <div className="mt-4 flex items-center justify-center gap-2 flex-wrap">
          {["두쫀쿠", "야르", "킹받네"].map((k) => (
            <button
              key={k}
              onClick={() => setView({ name: "search", query: k })}
              className="text-xs text-gray-500 border border-gray-300 px-2.5 py-1 hover:border-black hover:text-black"
            >
              {k}
            </button>
          ))}
        </div>
      </section>

      <section className="border-t border-black pt-8 pb-20">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-serif-kr text-xl flex items-center gap-2">
            <TrendingUp size={18} /> 지금 사람들이 찾는 밈
          </h2>
          <div className="flex gap-1">
            {periods.map((p) => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={`text-sm px-3 py-1 ${
                  period === p.key ? "bg-black text-white" : "text-gray-500 hover:text-black"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <ol className="divide-y divide-gray-200 border-t border-b border-gray-200">
          {list.map(({ meme, r, ch, isNew }) => (
            <li key={meme.id}>
              <button
                onClick={() => setView({ name: "detail", id: meme.id })}
                className="w-full flex items-center gap-4 py-4 text-left hover:bg-gray-50 px-2"
              >
                <span className="font-serif-kr text-2xl w-7 text-gray-300">{r}</span>
                <div className="flex-1">
                  <div className="text-black">{meme.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    검색량 {meme.popularity.search}K · 언급량 +{meme.popularity.buzz}%
                  </div>
                </div>
                <RankChange ch={ch} isNew={isNew} />
              </button>
            </li>
          ))}
        </ol>
        <p className="text-xs text-gray-400 mt-3">* 랭킹 수치는 초기 프로토타입용 Mock Data입니다.</p>
      </section>
    </div>
  );
}

/* ============================== 검색 결과 ============================== */

function SearchResultsView({ query, setView }) {
  const q = query.trim();
  const results = MEMES.filter(
    (m) => m.name.includes(q) || m.keywords.some((k) => k.includes(q)) || m.oneLiner.includes(q)
  );
  const exact = MEMES.find((m) => m.name === q);
  const grouped = CATEGORIES.map((cat) => ({
    cat,
    items: results.filter((m) => m.categories.includes(cat) && m.id !== exact?.id),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      <p className="text-sm text-gray-500 mb-1">검색 결과</p>
      <h1 className="font-serif-kr text-2xl mb-8">'{q}'</h1>

      {results.length === 0 ? (
        <div className="border border-gray-200 p-8 text-center">
          <p className="text-gray-600 mb-4">아직 밈 사전에 등록되지 않은 것 같아.</p>
          <p className="text-sm text-gray-400 mb-3">이런 항목은 어때?</p>
          <div className="flex justify-center gap-2 flex-wrap">
            {MEMES.slice(0, 4).map((m) => (
              <button
                key={m.id}
                onClick={() => setView({ name: "search", query: m.name })}
                className="text-xs border border-gray-300 px-2.5 py-1 hover:border-black"
              >
                {m.name}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          {exact && (
            <button
              onClick={() => setView({ name: "detail", id: exact.id })}
              className="block w-full text-left border-2 border-black p-6 mb-10 hover:bg-gray-50"
            >
              <div className="flex flex-wrap gap-1 mb-2">
                {exact.categories.map((c) => (
                  <CategoryTag key={c}>{c}</CategoryTag>
                ))}
              </div>
              <h2 className="font-serif-kr text-2xl mb-2">{exact.name}</h2>
              <p className="text-gray-600">{exact.oneLiner}</p>
              <span className="inline-flex items-center gap-1 text-sm mt-3 text-black">
                상세 보기 <ChevronRight size={14} />
              </span>
            </button>
          )}
          {grouped.map((g) => (
            <div key={g.cat} className="mb-10">
              <h3 className="text-sm text-gray-500 border-b border-gray-200 pb-2 mb-4">{g.cat}</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {g.items.map((m) => (
                  <MemeCard key={m.id} meme={m} onOpen={(id) => setView({ name: "detail", id })} />
                ))}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

/* ============================== 상세 페이지 ============================== */

function DetailView({ id, setView, user, scraps, toggleScrap }) {
  const meme = memeById(id);
  if (!meme) return <div className="max-w-3xl mx-auto px-5 py-20 text-center text-gray-500">밈을 찾을 수 없어.</div>;

  const isScrapped = scraps.includes(meme.id);
  const related = meme.relatedMemeIds.map(memeById).filter(Boolean);

  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      <div className="flex flex-wrap gap-1 mb-3">
        {meme.categories.map((c) => (
          <CategoryTag key={c}>{c}</CategoryTag>
        ))}
      </div>
      <div className="flex items-start justify-between gap-4 mb-2">
        <h1 className="font-serif-kr text-3xl md:text-4xl">{meme.name}</h1>
        <button
          onClick={() => (user ? toggleScrap(meme.id) : setView({ name: "auth" }))}
          className={`shrink-0 flex items-center gap-1.5 text-sm border px-3 py-1.5 ${
            isScrapped ? "border-black bg-black text-white" : "border-gray-300 text-gray-600 hover:border-black"
          }`}
        >
          <Heart size={14} fill={isScrapped ? "white" : "none"} /> {isScrapped ? "스크랩됨" : "스크랩"}
        </button>
      </div>
      <p className="text-gray-600 mb-8">{meme.oneLiner}</p>

      {/* 핵심 정보 */}
      <div className="grid sm:grid-cols-3 gap-px bg-gray-200 border border-gray-200 mb-12 text-sm">
        {[
          ["무엇인지", meme.oneLineSummary],
          ["유행 시기", meme.period],
          ["주요 플랫폼", meme.platforms.join(", ")],
          ["현재 화제성", `${meme.popularity.buzz} / 100`],
          ["카테고리", meme.categories.join(", ")],
          ["관련 키워드", meme.keywords.join(", ")],
        ].map(([label, value]) => (
          <div key={label} className="bg-white p-4">
            <div className="text-xs text-gray-400 mb-1">{label}</div>
            <div className="text-black">{value}</div>
          </div>
        ))}
      </div>

      {/* 설명 */}
      <div className="space-y-4 mb-12">
        {[
          ["이게 뭐야?", meme.whatIsIt],
          ["왜 유행했어?", meme.whyPopular],
          ["어떻게 사용하는 거야?", meme.howToUse],
        ].map(([title, text]) => (
          <div key={title} className="border border-gray-200 p-5">
            <h3 className="font-serif-kr text-base mb-2">{title}</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{text}</p>
          </div>
        ))}
        <div className="border border-black p-5">
          <h3 className="font-serif-kr text-base mb-2">한 줄 요약</h3>
          <p className="text-sm text-black">{meme.oneLineSummary}</p>
        </div>
      </div>

      {/* 유래와 확산 과정 */}
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-5">
          <h2 className="font-serif-kr text-xl">유래와 확산 과정</h2>
          <MockTag />
        </div>
        <div className="relative pl-6 border-l border-gray-300 space-y-6">
          {meme.timeline.map((t, i) => (
            <div key={i} className="relative">
              <span className="absolute -left-[27px] top-1 w-2.5 h-2.5 bg-black rounded-full" />
              <div className="text-xs text-gray-500 mb-0.5">{t.date}</div>
              <div className="text-sm text-black">{t.text}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 관련 영상 */}
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-5">
          <h2 className="font-serif-kr text-xl">관련 영상</h2>
          <MockTag />
        </div>
        {meme.relatedVideos.length === 0 ? (
          <p className="text-sm text-gray-400">등록된 관련 영상이 아직 없어.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {meme.relatedVideos.map((v, i) => (
              <div key={i} className="border border-gray-200">
                <div className="aspect-video bg-gray-100 flex items-center justify-center text-gray-300">
                  <Play size={28} />
                </div>
                <div className="p-3">
                  <div className="text-sm text-black">{v.title}</div>
                  <div className="text-xs text-gray-500 mt-1">{v.channel}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 관련 밈 */}
      <section className="mb-12">
        <h2 className="font-serif-kr text-xl mb-5">관련 밈</h2>
        {related.length === 0 ? (
          <p className="text-sm text-gray-400">관련 항목이 아직 등록되지 않았어.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {related.map((m) => (
              <MemeCard key={m.id} meme={m} onOpen={(mid) => setView({ name: "detail", id: mid })} />
            ))}
          </div>
        )}
      </section>

      {/* 관련 인물 */}
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-5">
          <h2 className="font-serif-kr text-xl">관련 인물</h2>
          <MockTag />
        </div>
        {meme.relatedPeople.length === 0 ? (
          <p className="text-sm text-gray-400">확인된 관련 인물 정보가 아직 없어.</p>
        ) : (
          <div className="space-y-3">
            {meme.relatedPeople.map((p, i) => (
              <div key={i} className="flex gap-3 border border-gray-200 p-4">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                  <User size={18} />
                </div>
                <div>
                  <div className="text-black text-sm">{p.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{p.reason}</div>
                  <div className="text-xs text-gray-400 mt-1">출처: {p.content} · 미확인 정보 포함 가능 (Mock Data)</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 유행 지표 */}
      <section>
        <div className="flex items-center gap-2 mb-5">
          <h2 className="font-serif-kr text-xl">유행 지표</h2>
          <MockTag />
        </div>
        <div className="space-y-4 max-w-md">
          <MetricBar label="화제성" value={meme.popularity.buzz} />
          <MetricBar label="검색량" value={meme.popularity.search} />
          <MetricBar label="사용 빈도" value={meme.popularity.usage} />
        </div>
      </section>
    </div>
  );
}

/* ============================== 트렌드 페이지 ============================== */

function TrendView({ setView }) {
  const [period, setPeriod] = useState("daily");
  const [cat, setCat] = useState("전체");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const periods = [
    { key: "daily", label: "오늘" },
    { key: "weekly", label: "이번 주" },
    { key: "monthly", label: "이번 달" },
    { key: "yearly", label: "올해" },
    { key: "custom", label: "직접 설정" },
  ];
  let list = unifiedRankList(period, customStart, customEnd);
  if (cat !== "전체") list = list.filter(({ meme }) => meme.categories.includes(cat));

  return (
    <div className="max-w-4xl mx-auto px-5 py-10">
      <h1 className="font-serif-kr text-3xl mb-6">트렌드</h1>
      <div className="flex gap-1 mb-3 flex-wrap">
        {periods.map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className={`text-sm px-3 py-1.5 ${period === p.key ? "bg-black text-white" : "text-gray-500 hover:text-black"}`}
          >
            {p.label}
          </button>
        ))}
      </div>
      {period === "custom" && (
        <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
          <input
            type="date"
            value={customStart}
            onChange={(e) => setCustomStart(e.target.value)}
            className="border border-gray-300 px-2 py-1.5 outline-none focus:border-black"
          />
          <span>~</span>
          <input
            type="date"
            value={customEnd}
            onChange={(e) => setCustomEnd(e.target.value)}
            className="border border-gray-300 px-2 py-1.5 outline-none focus:border-black"
          />
        </div>
      )}
      <div className="flex gap-2 flex-wrap mb-6">
        {["전체", ...CATEGORIES.filter((c) => c !== "영상" && c !== "기타")].map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`text-xs px-2.5 py-1 border ${cat === c ? "border-black bg-black text-white" : "border-gray-300 text-gray-600 hover:border-black"}`}
          >
            {c}
          </button>
        ))}
      </div>

      {period === "custom" && (!customStart || !customEnd) ? (
        <p className="text-sm text-gray-400 border-t border-black pt-6">
          시작일과 종료일을 선택하면 해당 기간의 순위를 보여줄게.
        </p>
      ) : (
        <div className="border-t border-black">
          {list.map(({ meme, r, ch, isNew, search, buzz }) => (
            <button
              key={meme.id}
              onClick={() => setView({ name: "detail", id: meme.id })}
              className="flex items-center gap-4 w-full text-left py-4 border-b border-gray-100 hover:bg-gray-50"
            >
              <span className="w-7 shrink-0 text-lg text-gray-300">{r}</span>
              <div className="flex-1 min-w-0">
                <div className="text-black">{meme.name}</div>
                <div className="text-xs text-gray-400 mt-0.5 truncate">{meme.oneLiner}</div>
              </div>
              <div className="shrink-0 flex items-center gap-1.5 text-xs text-gray-500 whitespace-nowrap">
                <span>검색량 {search}K</span>
                <span>·</span>
                <span>화제성 {buzz}</span>
                <RankChange ch={ch} isNew={isNew} />
              </div>
            </button>
          ))}
        </div>
      )}
      <p className="text-xs text-gray-400 mt-3">
        * 모든 순위·지표는 Mock Data입니다{period === "custom" && " (직접 설정 기간은 임의로 생성된 값)"}.
      </p>
    </div>
  );
}

/* ============================== 역사 (연도별 인터넷 연감) ============================== */

const ARCHIVE_YEARS = Array.from({ length: 2025 - 2000 + 1 }, (_, i) => 2000 + i);

function monthHighlight(year, month) {
  const prefix = `${year}.${String(month).padStart(2, "0")}`;
  for (const m of MEMES) {
    const hit = m.timeline.find((t) => t.date === prefix);
    if (hit) return { meme: m, text: hit.text };
  }
  return null;
}

function ArchiveView({ setView }) {
  const [year, setYear] = useState(2025);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      <h1 className="font-serif-kr text-3xl mb-6">역사</h1>
      <div className="flex gap-1 overflow-x-auto pb-2 mb-8 border-b border-gray-200">
        {ARCHIVE_YEARS.map((y) => (
          <button
            key={y}
            onClick={() => setYear(y)}
            className={`shrink-0 text-sm px-3 py-1.5 ${year === y ? "bg-black text-white" : "text-gray-500 hover:text-black"}`}
          >
            {y}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 mb-1">
        <h2 className="font-serif-kr text-2xl">{year}년 인터넷 연감</h2>
        <MockTag />
      </div>
      <p className="text-sm text-gray-400 mb-6">그 해 대한민국 인터넷을 채웠던 흐름을 월별로 정리했어.</p>

      <div className="divide-y divide-gray-200 border-t border-b border-gray-200">
        {months.map((m) => {
          const hit = monthHighlight(year, m);
          return (
            <div key={m} className="py-4">
              <div className="text-xs text-gray-400 mb-1">
                {year}년 {m}월
              </div>
              {hit ? (
                <button
                  onClick={() => setView({ name: "detail", id: hit.meme.id })}
                  className="text-left hover:underline"
                >
                  <span className="text-black">{hit.meme.name}</span>
                  <span className="block text-xs text-gray-500 mt-0.5">{hit.text}</span>
                </button>
              ) : (
                <span className="text-gray-300">○○</span>
              )}
            </div>
          );
        })}
      </div>
      <p className="text-xs text-gray-400 mt-3">
        * ○○는 아직 기록이 등록되지 않은 달이야. 채워진 항목도 프로토타입용 Mock Data라 실제 역사적 사실이 아니야.
      </p>
    </div>
  );
}

/* ============================== 밈 사전 페이지 ============================== */

function DictionaryView({ setView }) {
  const [sort, setSort] = useState("popular");
  const [cat, setCat] = useState("전체");
  const [q, setQ] = useState("");

  let list = MEMES.filter((m) => (cat === "전체" || m.categories.includes(cat)) && m.name.includes(q.trim()));
  if (sort === "popular") list = [...list].sort((a, b) => b.popularity.buzz - a.popularity.buzz);
  if (sort === "recent") list = [...list].sort((a, b) => (a.rank.daily.r ?? 999) - (b.rank.daily.r ?? 999));
  if (sort === "alpha") list = [...list].sort((a, b) => a.name.localeCompare(b.name, "ko"));
  if (sort === "registered") list = [...list].sort((a, b) => new Date(b.registeredAt) - new Date(a.registeredAt));

  return (
    <div className="max-w-4xl mx-auto px-5 py-10">
      <h1 className="font-serif-kr text-3xl mb-6">밈 사전</h1>
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between mb-4">
        <div className="flex gap-2 flex-wrap">
          {["전체", ...CATEGORIES.filter((c) => c !== "영상" && c !== "기타")].map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`text-xs px-2.5 py-1 border ${cat === c ? "border-black bg-black text-white" : "border-gray-300 text-gray-600 hover:border-black"}`}
            >
              {c}
            </button>
          ))}
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="text-sm border border-gray-300 px-2 py-1.5 outline-none"
        >
          <option value="recent">최근 유행순</option>
          <option value="popular">인기순</option>
          <option value="alpha">가나다순</option>
          <option value="registered">최신 등록순</option>
        </select>
      </div>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="사전 안에서 검색"
        className="w-full border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black mb-6"
      />
      {list.length === 0 ? (
        <p className="text-sm text-gray-400">조건에 맞는 항목이 없어.</p>
      ) : (
        <div className="grid sm:grid-cols-3 gap-3">
          {list.map((m) => (
            <MemeCard key={m.id} meme={m} onOpen={(id) => setView({ name: "detail", id })} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================== 로그인 / 회원가입 ============================== */

function AuthView({ setView, onAuth }) {
  const [mode, setMode] = useState("login");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");

  const submit = (e) => {
    e.preventDefault();
    onAuth({ nickname: nickname || email.split("@")[0] || "사용자", email });
    setView({ name: "mypage", tab: "overview" });
  };

  return (
    <div className="max-w-sm mx-auto px-5 py-16">
      <div className="flex border-b border-gray-200 mb-8">
        {["login", "signup"].map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 text-sm py-2.5 border-b-2 ${mode === m ? "border-black text-black" : "border-transparent text-gray-400"}`}
          >
            {m === "login" ? "로그인" : "회원가입"}
          </button>
        ))}
      </div>
      <form onSubmit={submit} className="space-y-3">
        {mode === "signup" && (
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="닉네임"
            required
            className="w-full border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-black"
          />
        )}
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="이메일"
          required
          className="w-full border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-black"
        />
        <input
          type="password"
          placeholder="비밀번호"
          required
          className="w-full border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-black"
        />
        <button type="submit" className="w-full bg-black text-white py-2.5 text-sm mt-2">
          {mode === "login" ? "로그인" : "가입하기"}
        </button>
      </form>
      <p className="text-xs text-gray-400 mt-4">
        프로토타입 버전이라 실제 인증 서버는 연결되어 있지 않아. 입력한 정보로 임시 세션만 만들어져.
      </p>
    </div>
  );
}

/* ============================== 마이페이지 ============================== */

function MyPageView({ user, scraps, recentlyViewed, setView, toggleScrap }) {
  if (!user) {
    return (
      <div className="max-w-md mx-auto px-5 py-20 text-center">
        <p className="text-gray-600 mb-4">로그인이 필요해.</p>
        <button onClick={() => setView({ name: "auth" })} className="border border-black px-4 py-2 text-sm hover:bg-black hover:text-white">
          로그인하러 가기
        </button>
      </div>
    );
  }

  const scrapMemes = scraps.map(memeById).filter(Boolean);
  const recentMemes = recentlyViewed.map(memeById).filter(Boolean);
  const interestedTrends = rankList("weekly").slice(0, 3);
  const folders = CATEGORIES.map((c) => ({ cat: c, items: scrapMemes.filter((m) => m.categories.includes(c)) })).filter(
    (f) => f.items.length > 0
  );

  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      <h1 className="font-serif-kr text-3xl mb-1">마이페이지</h1>
      <p className="text-sm text-gray-500 mb-10">{user.nickname}님</p>

      <section className="mb-12">
        <h2 className="font-serif-kr text-lg mb-4">내가 스크랩한 밈</h2>
        {scrapMemes.length === 0 ? (
          <p className="text-sm text-gray-400">아직 스크랩한 밈이 없어.</p>
        ) : (
          <div className="grid sm:grid-cols-3 gap-3">
            {scrapMemes.map((m) => (
              <div key={m.id} className="relative">
                <MemeCard meme={m} onOpen={(id) => setView({ name: "detail", id })} />
                <button
                  onClick={() => toggleScrap(m.id)}
                  className="absolute top-3 right-3 text-black"
                  title="스크랩 해제"
                >
                  <Heart size={16} fill="black" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mb-12">
        <h2 className="font-serif-kr text-lg mb-4">최근 본 밈</h2>
        {recentMemes.length === 0 ? (
          <p className="text-sm text-gray-400">최근에 본 밈이 없어.</p>
        ) : (
          <div className="flex gap-2 flex-wrap">
            {recentMemes.map((m) => (
              <button
                key={m.id}
                onClick={() => setView({ name: "detail", id: m.id })}
                className="text-sm border border-gray-300 px-3 py-1.5 hover:border-black"
              >
                {m.name}
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="mb-12">
        <h2 className="font-serif-kr text-lg mb-4">관심 트렌드</h2>
        <div className="flex gap-2 flex-wrap">
          {interestedTrends.map(({ meme }) => (
            <button
              key={meme.id}
              onClick={() => setView({ name: "detail", id: meme.id })}
              className="text-sm border border-gray-300 px-3 py-1.5 hover:border-black"
            >
              {meme.name}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-serif-kr text-lg mb-4">내 스크랩 폴더</h2>
        {folders.length === 0 ? (
          <p className="text-sm text-gray-400">폴더는 스크랩한 항목이 있으면 카테고리별로 자동 생성돼.</p>
        ) : (
          <div className="space-y-4">
            {folders.map((f) => (
              <div key={f.cat}>
                <div className="text-xs text-gray-400 mb-1.5">{f.cat} ({f.items.length})</div>
                <div className="flex gap-2 flex-wrap">
                  {f.items.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setView({ name: "detail", id: m.id })}
                      className="text-xs border border-gray-200 px-2 py-1 hover:border-black"
                    >
                      {m.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/* ============================== App ============================== */

export default function App() {
  const [view, setViewRaw] = useState({ name: "home" });
  const [user, setUser] = useState(null);
  const [scraps, setScraps] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  const setView = (v) => {
    if (v.name === "detail") {
      setRecentlyViewed((prev) => [v.id, ...prev.filter((id) => id !== v.id)].slice(0, 5));
    }
    setViewRaw(v);
    window.scrollTo?.(0, 0);
  };

  const toggleScrap = (id) => {
    setScraps((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  return (
    <div className="font-sans-kr min-h-screen bg-white text-black">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;900&display=swap');
        .font-serif-kr { font-family: 'Noto Sans KR', sans-serif; font-weight: 700; letter-spacing: -0.01em; }
        .font-sans-kr { font-family: 'Noto Sans KR', sans-serif; }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>

      <NavBar view={view} setView={setView} user={user} onLogout={() => setUser(null)} />

      {view.name === "home" && <HomeView setView={setView} />}
      {view.name === "search" && <SearchResultsView query={view.query} setView={setView} />}
      {view.name === "detail" && (
        <DetailView id={view.id} setView={setView} user={user} scraps={scraps} toggleScrap={toggleScrap} />
      )}
      {view.name === "trend" && <TrendView setView={setView} />}
      {view.name === "dictionary" && <DictionaryView setView={setView} />}
      {view.name === "archive" && <ArchiveView setView={setView} />}
      {view.name === "auth" && <AuthView setView={setView} onAuth={setUser} />}
      {view.name === "mypage" && (
        <MyPageView user={user} scraps={scraps} recentlyViewed={recentlyViewed} setView={setView} toggleScrap={toggleScrap} />
      )}

      <footer className="border-t border-gray-200 mt-16 py-8">
        <div className="max-w-5xl mx-auto px-5 text-xs text-gray-400">
          유행도감 · 프로토타입 버전 · 모든 순위·통계·인물 정보는 Mock Data이며 실제 사실이 아닙니다.
        </div>
      </footer>
    </div>
  );
}
