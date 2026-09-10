import { useState } from "react";
import { Heart, LogOut, Search } from "lucide-react";
import { Logo } from "./Logo";
import { SearchBar } from "./SearchBar";

function NavItem({ target, current, setView, children }) {
  return (
    <button
      onClick={() => setView({ name: target })}
      className={`text-sm px-1 py-1 border-b-2 ${
        current === target ? "border-black text-black" : "border-transparent text-gray-500 hover:text-black"
      }`}
    >
      {children}
    </button>
  );
}

export function NavBar({ view, setView, user, onLogout }) {
  const [navSearch, setNavSearch] = useState(false);

  return (
    <header className="border-b border-black sticky top-0 bg-white z-30">
      <div className="max-w-5xl mx-auto px-5 py-3 flex items-center gap-6">
        <Logo onClick={() => setView({ name: "home" })} />
        <nav className="flex items-center gap-5 flex-1">
          <NavItem target="home" current={view.name} setView={setView}>홈</NavItem>
          <NavItem target="trend" current={view.name} setView={setView}>트렌드</NavItem>
          <NavItem target="dictionary" current={view.name} setView={setView}>밈 사전</NavItem>
          <NavItem target="archive" current={view.name} setView={setView}>역사</NavItem>
          <button
            onClick={() => setNavSearch((v) => !v)}
            className="text-sm px-1 py-1 text-gray-500 hover:text-black flex items-center gap-1"
          >
            <Search size={14} /> 검색
          </button>
        </nav>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setView({ name: "scraps" })}
            className={`text-sm flex items-center gap-1 ${
              view.name === "scraps" ? "text-black" : "text-gray-500 hover:text-black"
            }`}
          >
            <Heart size={14} /> 스크랩
          </button>
          {user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setView({ name: "mypage" })}
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
