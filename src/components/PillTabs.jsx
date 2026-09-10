const VARIANT_CLASS = {
  solid: {
    base: "text-sm px-3 py-1.5",
    active: "bg-black text-white",
    inactive: "text-gray-500 hover:text-black",
  },
  outline: {
    base: "text-xs px-2.5 py-1 border",
    active: "border-black bg-black text-white",
    inactive: "border-gray-300 text-gray-600 hover:border-black",
  },
};

export function PillTabs({ options, value, onChange, variant = "solid", wrap = true, shrink = false }) {
  const style = VARIANT_CLASS[variant];
  return (
    <div className={`flex gap-1 ${wrap ? "flex-wrap" : "overflow-x-auto pb-2"}`}>
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
