import { useState } from "react";
import { ChevronDown, Heart, LogOut, Search, Settings, UserRound } from "lucide-react";
import { Logo } from "./Logo";
import { SearchBar } from "./SearchBar";

function NavItem({ target, current, setView, children }) {
  const active = current === target;
  return (
    <button
      onClick={() => setView({ name: target })}
      className={`relative text-sm px-1 py-1 transition-colors ${
        active ? "text-neutral-900 font-medium" : "text-neutral-500 hover:text-neutral-900"
      }`}
    >
      {children}
      <span
        className={`absolute left-0 right-0 -bottom-[1px] h-[2px] rounded-full brand-gradient transition-transform duration-200 origin-left ${
          active ? "scale-x-100" : "scale-x-0"
        }`}
      />
    </button>
  );
}

// 계정 메뉴 — 아바타가 뭘 누르는 자리인지 애매했던 걸 "이름 + 화살표 = 열리는 메뉴"로 명확하게 바꿈.
// 메뉴 항목은 onMouseDown을 씀 — onBlur(패널 닫기)보다 먼저 실행돼야 클릭이 씹히지 않음 (SearchBar와 동일 패턴).
function UserMenu({ user, setView, onLogout }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className={`flex items-center gap-2 pl-1 pr-2 py-1 rounded-full transition-colors ${
          open ? "bg-neutral-100" : "hover:bg-neutral-100"
        }`}
      >
        <span className="w-7 h-7 rounded-full brand-gradient text-white text-xs font-medium flex items-center justify-center shrink-0">
          {user.nickname.slice(0, 1)}
        </span>
        <span className="text-sm text-neutral-700 max-w-[6rem] truncate hidden sm:inline">{user.nickname}</span>
        <ChevronDown size={14} className={`text-neutral-400 transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl ring-1 ring-neutral-200 shadow-xl overflow-hidden z-40 py-1.5">
          <div className="px-4 py-2 border-b border-neutral-100">
            <div className="text-sm font-medium text-neutral-900 truncate">{user.nickname}님</div>
            <div className="text-xs text-neutral-400 truncate">{user.email}</div>
          </div>
          <button
            onMouseDown={() => setView({ name: "mypage" })}
            className="w-full text-left px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2.5 transition-colors"
          >
            <UserRound size={15} className="text-neutral-400" /> 마이페이지
          </button>
          <button
            onMouseDown={() => setView({ name: "editProfile" })}
            className="w-full text-left px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 flex items-center gap-2.5 transition-colors"
          >
            <Settings size={15} className="text-neutral-400" /> 내 정보 수정
          </button>
          <div className="h-px bg-neutral-100 my-1" />
          <button
            onMouseDown={onLogout}
            className="w-full text-left px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors"
          >
            <LogOut size={15} /> 로그아웃
          </button>
        </div>
      )}
    </div>
  );
}

export function NavBar({ view, setView, user, onLogout }) {
  const [navSearch, setNavSearch] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-neutral-200/80">
      <div className="max-w-5xl mx-auto px-5 py-3 flex items-center gap-6">
        <Logo onClick={() => setView({ name: "home" })} />
        <nav className="flex items-center gap-5 flex-1">
          <NavItem target="home" current={view.name} setView={setView}>홈</NavItem>
          <NavItem target="trend" current={view.name} setView={setView}>트렌드</NavItem>
          <NavItem target="dictionary" current={view.name} setView={setView}>밈 사전</NavItem>
          <NavItem target="archive" current={view.name} setView={setView}>역사</NavItem>
          <button
            onClick={() => setNavSearch((v) => !v)}
            className={`text-sm px-1 py-1 flex items-center gap-1 transition-colors ${
              navSearch ? "text-neutral-900" : "text-neutral-500 hover:text-neutral-900"
            }`}
          >
            <Search size={14} /> 검색
          </button>
        </nav>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setView({ name: "scraps" })}
            className={`text-sm flex items-center gap-1 transition-colors ${
              view.name === "scraps" ? "text-rose-500" : "text-neutral-500 hover:text-rose-500"
            }`}
          >
            <Heart size={14} fill={view.name === "scraps" ? "currentColor" : "none"} /> 스크랩
          </button>
          {user ? (
            <UserMenu user={user} setView={setView} onLogout={onLogout} />
          ) : (
            <button onClick={() => setView({ name: "auth" })} className="btn-primary !px-3.5 !py-1.5 text-sm">
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
