import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { MEMES } from "../data/memes";

export function SearchBar({ initialValue = "", onSearch, size = "large" }) {
  const [value, setValue] = useState(initialValue);
  const [focused, setFocused] = useState(false);

  const suggestions = useMemo(() => {
    const q = value.trim();
    if (!q) return [];
    const matched = MEMES.filter((m) => m.name.includes(q)).slice(0, 3);
    const out = [];
    matched.forEach((m) => {
      out.push(m.name, `${m.name} 유래`, `${m.name} 관련 영상`);
    });
    return out.slice(0, 6);
  }, [value]);

  const submit = (q) => {
    const query = (q ?? value).trim();
    if (!query) return;
    setFocused(false);
    onSearch(query);
  };

  const isLarge = size === "large";

  return (
    <div className="relative w-full">
      <div
        className={`flex items-center bg-white rounded-2xl ring-1 transition-all duration-200 ${
          focused ? "ring-2 ring-violet-500/40 shadow-[0_8px_30px_-8px_rgba(124,58,237,0.35)]" : "ring-neutral-200 shadow-sm"
        } ${isLarge ? "px-5 py-4" : "px-3 py-2 rounded-xl"}`}
      >
        <Search size={isLarge ? 22 : 16} className={`shrink-0 transition-colors ${focused ? "text-violet-500" : "text-neutral-400"}`} />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 120)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="밈, 유행어, 상품을 검색해봐 · 예: 두쫀쿠, 야르, 킹받네"
          className={`w-full outline-none px-3 bg-transparent ${isLarge ? "text-lg" : "text-sm"} font-sans-kr placeholder:text-neutral-400`}
        />
        {value && (
          <button onClick={() => setValue("")} className="text-neutral-400 hover:text-neutral-900 shrink-0 transition-colors">
            <X size={16} />
          </button>
        )}
      </div>
      {focused && suggestions.length > 0 && (
        <div className="absolute z-20 left-0 right-0 mt-2 bg-white rounded-2xl ring-1 ring-neutral-200 shadow-xl overflow-hidden">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onMouseDown={() => submit(s)}
              className="w-full text-left px-5 py-2.5 text-sm text-neutral-700 hover:bg-violet-50 hover:text-violet-700 border-b border-neutral-100 last:border-0 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
