import { ChevronRight } from "lucide-react";
import { MemeCard } from "../components/MemeCard";
import { CATEGORIES, memeById } from "../data/memes";
import { rankList } from "../data/rank";

const SCRAP_PREVIEW_COUNT = 6;

export function MyPageView({ user, scraps, recentlyViewed, setView }) {
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
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif-kr text-lg">내가 스크랩한 밈</h2>
          {scrapMemes.length > 0 && (
            <button
              onClick={() => setView({ name: "scraps" })}
              className="text-xs text-gray-500 hover:text-black flex items-center gap-0.5"
            >
              전체보기 <ChevronRight size={12} />
            </button>
          )}
        </div>
        {scrapMemes.length === 0 ? (
          <p className="text-sm text-gray-400">아직 스크랩한 밈이 없어.</p>
        ) : (
          <div className="grid sm:grid-cols-3 gap-3">
            {scrapMemes.slice(0, SCRAP_PREVIEW_COUNT).map((m) => (
              <MemeCard key={m.id} meme={m} onOpen={(id) => setView({ name: "detail", id })} />
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
