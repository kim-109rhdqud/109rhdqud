import { Heart } from "lucide-react";
import { MemeCard } from "../components/MemeCard";
import { memeById } from "../data/memes";

export function ScrapsView({ user, scraps, toggleScrap, setView }) {
  if (!user) {
    return (
      <div className="max-w-md mx-auto px-5 py-20 text-center">
        <p className="text-gray-600 mb-4">스크랩 목록을 보려면 로그인이 필요해.</p>
        <button onClick={() => setView({ name: "auth" })} className="border border-black px-4 py-2 text-sm hover:bg-black hover:text-white">
          로그인하러 가기
        </button>
      </div>
    );
  }

  const scrapMemes = scraps.map(memeById).filter(Boolean);

  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      <h1 className="font-serif-kr text-3xl mb-1">스크랩 목록</h1>
      <p className="text-sm text-gray-500 mb-10">{user.nickname}님이 스크랩한 {scrapMemes.length}개의 밈</p>

      {scrapMemes.length === 0 ? (
        <div className="border border-gray-200 p-8 text-center">
          <p className="text-gray-600 mb-4">아직 스크랩한 밈이 없어.</p>
          <button
            onClick={() => setView({ name: "dictionary" })}
            className="border border-black px-4 py-2 text-sm hover:bg-black hover:text-white"
          >
            밈 사전 둘러보기
          </button>
        </div>
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
    </div>
  );
}
