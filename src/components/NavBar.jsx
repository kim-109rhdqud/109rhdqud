import { useState } from "react";
import { Heart, LogOut, Search } from "lucide-react";
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
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setView({ name: "mypage" })}
                className="w-8 h-8 rounded-full brand-gradient text-white text-xs font-medium flex items-center justify-center shadow-[0_2px_8px_-2px_rgba(124,58,237,0.5)] hover:scale-105 transition-transform"
                title={user.nickname}
              >
                {user.nickname.slice(0, 1)}
              </button>
              <button onClick={onLogout} className="text-neutral-400 hover:text-neutral-900 transition-colors" title="로그아웃">
                <LogOut size={15} />
              </button>
            </div>
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
