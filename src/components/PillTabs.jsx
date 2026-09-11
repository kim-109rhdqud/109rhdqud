const VARIANT_CLASS = {
  solid: {
    base: "text-sm px-3.5 py-1.5 rounded-full transition-all duration-150",
    active: "brand-gradient text-white shadow-[0_2px_10px_-2px_rgba(124,58,237,0.5)]",
    inactive: "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900",
  },
  outline: {
    base: "text-xs px-3 py-1.5 rounded-full border transition-all duration-150",
    active: "border-violet-500 bg-violet-50 text-violet-700 font-medium",
    inactive: "border-neutral-200 text-neutral-600 hover:border-neutral-400",
  },
};

export function PillTabs({ options, value, onChange, variant = "solid", wrap = true, shrink = false }) {
  const style = VARIANT_CLASS[variant];
  return (
    <div className={`flex gap-1.5 ${wrap ? "flex-wrap" : "overflow-x-auto pb-2"}`}>
      {options.map((opt) => (
        <button
          key={opt.key}
          onClick={() => onChange(opt.key)}
          className={`${shrink ? "shrink-0 " : ""}${style.base} ${value === opt.key ? style.active : style.inactive}`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
