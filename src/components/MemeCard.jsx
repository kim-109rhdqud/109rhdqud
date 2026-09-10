import { CategoryTag } from "./CategoryTag";

export function MemeCard({ meme, onOpen }) {
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
