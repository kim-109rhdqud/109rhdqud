import { Heart } from "lucide-react";
import { MemeCard } from "../components/MemeCard";
import { memeById } from "../data/memes";

export function ScrapsView({ user, scraps, toggleScrap, setView }) {
  if (!user) {
    return (
      <div className="max-w-md mx-auto px-5 py-20 text-center">
        <p className="text-neutral-600 mb-4">스크랩 목록을 보려면 로그인이 필요해.</p>
        <button onClick={() => setView({ name: "auth" })} className="btn-primary">
          로그인하러 가기
        </button>
      </div>
    );
  }

  const scrapMemes = scraps.map(memeById).filter(Boolean);

  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      <h1 className="font-serif-kr text-3xl mb-1">스크랩 목록</h1>
      <p className="text-sm text-neutral-500 mb-10">{user.nickname}님이 스크랩한 {scrapMemes.length}개의 밈</p>

      {scrapMemes.length === 0 ? (
        <div className="surface-card p-10 text-center">
          <p className="text-neutral-600 mb-4">아직 스크랩한 밈이 없어.</p>
          <button onClick={() => setView({ name: "dictionary" })} className="btn-secondary">
            밈 사전 둘러보기
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-3 gap-3.5">
          {scrapMemes.map((m) => (
            <div key={m.id} className="relative">
              <MemeCard meme={m} onOpen={(id) => setView({ name: "detail", id })} />
              <button
                onClick={() => toggleScrap(m.id)}
                className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/90 backdrop-blur shadow-sm ring-1 ring-neutral-200 flex items-center justify-center text-rose-500 hover:bg-rose-50 transition-colors"
                title="스크랩 해제"
              >
                <Heart size={13} fill="currentColor" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
