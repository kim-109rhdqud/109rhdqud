import { NavBar } from "./components/NavBar";
import { useAppState } from "./hooks/useAppState";
import { HomeView } from "./pages/HomeView";
import { SearchResultsView } from "./pages/SearchResultsView";
import { DetailView } from "./pages/DetailView";
import { TrendView } from "./pages/TrendView";
import { DictionaryView } from "./pages/DictionaryView";
import { ArchiveView } from "./pages/ArchiveView";
import { AuthView } from "./pages/AuthView";
import { MyPageView } from "./pages/MyPageView";
import { ScrapsView } from "./pages/ScrapsView";

export default function App() {
  const { view, setView, user, setUser, scraps, toggleScrap, recentlyViewed, logout } = useAppState();

  return (
    <div className="font-sans-kr min-h-screen bg-white text-black">
      <NavBar view={view} setView={setView} user={user} onLogout={logout} />

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
        <MyPageView user={user} scraps={scraps} recentlyViewed={recentlyViewed} setView={setView} />
      )}
      {view.name === "scraps" && (
        <ScrapsView user={user} scraps={scraps} toggleScrap={toggleScrap} setView={setView} />
      )}

      <footer className="border-t border-gray-200 mt-16 py-8">
        <div className="max-w-5xl mx-auto px-5 text-xs text-gray-400">
          유행도감 · 프로토타입 버전 · 모든 순위·통계·인물 정보는 Mock Data이며 실제 사실이 아닙니다.
        </div>
      </footer>
    </div>
  );
}
