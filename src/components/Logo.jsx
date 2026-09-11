export function Logo({ onClick }) {
  return (
    <button onClick={onClick} className="font-serif-kr text-xl tracking-tight flex items-center gap-1.5 group">
      <span className="w-2 h-2 rounded-full brand-gradient group-hover:scale-125 transition-transform duration-200" />
      <span className="brand-gradient-text">유행도감</span>
    </button>
  );
}
