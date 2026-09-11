export function MetricBar({ label, value }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-sm text-neutral-600">{label}</span>
        <span className="font-serif-kr text-sm text-neutral-900">{value}</span>
      </div>
      <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
        <div className="h-2 rounded-full brand-gradient transition-all duration-500" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
