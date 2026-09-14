import { Loader2 } from "lucide-react";
import { NavBar } from "./components/NavBar";
import { useAppState } from "./hooks/useAppState";
import { HomeView } from "./pages/HomeView";
import { SearchResultsView } from "./pages/SearchResultsView";
import { DetailView } from "./pages/DetailView";
import { TrendView } from "./pages/TrendView";
import { DictionaryView } from "./pages/DictionaryView";
import { ArchiveView } from "./pages/ArchiveView";
import { AuthView } from "./pages/AuthView";
import { VerifyEmailView } from "./pages/VerifyEmailView";
import { CompleteProfileView } from "./pages/CompleteProfileView";
import { MyPageView } from "./pages/MyPageView";
import { EditProfileView } from "./pages/EditProfileView";
import { ScrapsView } from "./pages/ScrapsView";
import { AdminUsersView } from "./pages/AdminUsersView";
import { SubmitMemeView } from "./pages/SubmitMemeView";
import { MySubmissionsView } from "./pages/MySubmissionsView";
import { SubmissionQueueView } from "./pages/SubmissionQueueView";
import { RegisterMemeView } from "./pages/RegisterMemeView";

export default function App() {
  const {
    view,
    setView,
    user,
    setUser,
    memes,
    memesLoading,
    memeById,
    refreshMemes,
    scraps,
    toggleScrap,
    recentlyViewed,
    logout,
  } = useAppState();

  return (
    <div className="font-sans-kr min-h-screen bg-neutral-50 text-neutral-900">
      <NavBar view={view} setView={setView} user={user} onLogout={logout} memes={memes} />

      {memesLoading ? (
        <div className="flex items-center justify-center py-32 text-neutral-400">
          <Loader2 size={22} className="animate-spin" />
        </div>
      ) : user && !user.profileComplete ? (
        // 카카오/구글로 막 가입한 계정은 아이디/실명/생년월일/휴대전화를 채우기 전까진
        // 다른 화면 대신 이 온보딩만 보이게 강제함.
        <div key="completeProfile-gate" className="page-transition">
          <CompleteProfileView user={user} onUpdate={setUser} setView={setView} logout={logout} />
        </div>
      ) : (
        // view가 바뀔 때마다 key도 바뀌어서 매번 새로 마운트되고, 그때 page-transition 애니메이션이 자동으로 재생됨.
        // 화면이 뚝뚝 끊기듯 바뀌는 느낌을 없애려는 용도(그냥 CSS 애니메이션이라 라이브러리 없이 처리).
        <div key={`${view.name}:${view.id ?? ""}:${view.query ?? ""}`} className="page-transition">
          {view.name === "home" && <HomeView setView={setView} memes={memes} />}
          {view.name === "search" && <SearchResultsView query={view.query} setView={setView} memes={memes} />}
          {view.name === "detail" && (
            <DetailView
              id={view.id}
              setView={setView}
              user={user}
              scraps={scraps}
              toggleScrap={toggleScrap}
              memeById={memeById}
              refreshMemes={refreshMemes}
            />
          )}
          {view.name === "trend" && <TrendView setView={setView} memes={memes} />}
          {view.name === "dictionary" && <DictionaryView setView={setView} memes={memes} />}
          {view.name === "archive" && <ArchiveView setView={setView} memes={memes} />}
          {view.name === "auth" && <AuthView setView={setView} onAuth={setUser} oauthError={view.error} />}
          {view.name === "verifyEmail" && <VerifyEmailView token={view.token} setView={setView} setUser={setUser} />}
          {view.name === "completeProfile" && (
            <CompleteProfileView user={user} onUpdate={setUser} setView={setView} logout={logout} />
          )}
          {view.name === "mypage" && (
            <MyPageView
              user={user}
              scraps={scraps}
              recentlyViewed={recentlyViewed}
              setView={setView}
              memes={memes}
              memeById={memeById}
            />
          )}
          {view.name === "editProfile" && (
            <EditProfileView user={user} onUpdate={setUser} setView={setView} linked={view.linked} linkError={view.linkError} />
          )}
          {view.name === "scraps" && (
            <ScrapsView user={user} scraps={scraps} toggleScrap={toggleScrap} setView={setView} memeById={memeById} />
          )}
          {view.name === "admin" && <AdminUsersView user={user} />}
          {view.name === "submit" && <SubmitMemeView user={user} setView={setView} />}
          {view.name === "mySubmissions" && <MySubmissionsView user={user} setView={setView} />}
          {view.name === "submissionQueue" && <SubmissionQueueView user={user} setView={setView} />}
          {view.name === "registerMeme" && (
            <RegisterMemeView user={user} setView={setView} memes={memes} refreshMemes={refreshMemes} prefill={view.prefill} />
          )}
        </div>
      )}

      <footer className="border-t border-neutral-200 mt-16 py-8">
        <div className="max-w-5xl mx-auto px-5 text-xs text-neutral-400">
          유행도감 · 프로토타입 버전 · 모든 순위·통계·인물 정보는 Mock Data이며 실제 사실이 아닙니다.
        </div>
      </footer>
    </div>
  );
}
