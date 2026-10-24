import { Flame } from "lucide-react";
import { CategoryTag } from "./CategoryTag";
import { VerificationBadge } from "./VerificationBadge";
import { GradeBadge } from "./GradeBadge";

export function MemeCard({ meme, onOpen }) {
  return (
    <button
      onClick={() => onOpen(meme.id)}
      className="surface-card-interactive text-left p-4 w-full group"
    >
      <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
        {meme.categories.map((c) => (
          <CategoryTag key={c}>{c}</CategoryTag>
        ))}
        <VerificationBadge verification={meme.verification} />
        <GradeBadge grade={meme.grade} compact />
      </div>
      <h3 className="font-serif-kr text-lg mb-1 text-neutral-900 group-hover:brand-gradient-text transition-all">
        {meme.name}
      </h3>
      <p className="text-sm text-neutral-500 leading-relaxed mb-3 line-clamp-2">{meme.oneLiner}</p>
      <div className="flex items-center justify-between text-xs text-neutral-400">
        <span>{meme.period}</span>
        <span className="inline-flex items-center gap-1 text-rose-500 font-medium">
          <Flame size={12} fill="currentColor" /> {meme.popularity.buzz}
        </span>
      </div>
    </button>
  );
}
