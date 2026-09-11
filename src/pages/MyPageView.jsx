import { ChevronRight } from "lucide-react";
import { MemeCard } from "../components/MemeCard";
import { CATEGORIES, memeById } from "../data/memes";
import { rankList } from "../data/rank";

const SCRAP_PREVIEW_COUNT = 6;

export function MyPageView({ user, scraps, recentlyViewed, setView }) {
  if (!user) {
    return (
      <div className="max-w-md mx-auto px-5 py-20 text-center">
        <p className="text-neutral-600 mb-4">로그인이 필요해.</p>
        <button onClick={() => setView({ name: "auth" })} className="btn-primary">
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
      <div className="flex items-center justify-between gap-4 mb-12">
        <div className="flex items-center gap-3.5">
          <span className="w-12 h-12 rounded-full brand-gradient text-white flex items-center justify-center font-serif-kr text-lg shadow-[0_4px_14px_-4px_rgba(124,58,237,0.5)]">
            {user.nickname.slice(0, 1)}
          </span>
          <div>
            <h1 className="font-serif-kr text-2xl">{user.nickname}님</h1>
            <p className="text-sm text-neutral-400">마이페이지</p>
          </div>
        </div>
        <button onClick={() => setView({ name: "editProfile" })} className="btn-secondary shrink-0 text-sm !py-1.5">
          내 정보 수정
        </button>
      </div>

      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif-kr text-lg">내가 스크랩한 밈</h2>
          {scrapMemes.length > 0 && (
            <button
              onClick={() => setView({ name: "scraps" })}
              className="text-xs text-neutral-500 hover:text-violet-600 flex items-center gap-0.5 transition-colors"
            >
              전체보기 <ChevronRight size={12} />
            </button>
          )}
        </div>
        {scrapMemes.length === 0 ? (
          <p className="text-sm text-neutral-400">아직 스크랩한 밈이 없어.</p>
        ) : (
          <div className="grid sm:grid-cols-3 gap-3.5">
            {scrapMemes.slice(0, SCRAP_PREVIEW_COUNT).map((m) => (
              <MemeCard key={m.id} meme={m} onOpen={(id) => setView({ name: "detail", id })} />
            ))}
          </div>
        )}
      </section>

      <section className="mb-12">
        <h2 className="font-serif-kr text-lg mb-4">최근 본 밈</h2>
        {recentMemes.length === 0 ? (
          <p className="text-sm text-neutral-400">최근에 본 밈이 없어.</p>
        ) : (
          <div className="flex gap-2 flex-wrap">
            {recentMemes.map((m) => (
              <button
                key={m.id}
                onClick={() => setView({ name: "detail", id: m.id })}
                className="text-sm bg-white rounded-full ring-1 ring-neutral-200 px-3.5 py-1.5 hover:ring-violet-300 hover:text-violet-700 transition-all shadow-sm"
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
              className="text-sm bg-white rounded-full ring-1 ring-neutral-200 px-3.5 py-1.5 hover:ring-violet-300 hover:text-violet-700 transition-all shadow-sm"
            >
              {meme.name}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-serif-kr text-lg mb-4">내 스크랩 폴더</h2>
        {folders.length === 0 ? (
          <p className="text-sm text-neutral-400">폴더는 스크랩한 항목이 있으면 카테고리별로 자동 생성돼.</p>
        ) : (
          <div className="space-y-4">
            {folders.map((f) => (
              <div key={f.cat}>
                <div className="text-xs text-neutral-400 mb-1.5">{f.cat} ({f.items.length})</div>
                <div className="flex gap-2 flex-wrap">
                  {f.items.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setView({ name: "detail", id: m.id })}
                      className="text-xs bg-white rounded-full ring-1 ring-neutral-200 px-2.5 py-1 hover:ring-violet-300 transition-all"
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
