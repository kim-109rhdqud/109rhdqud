export function MetricBar({ label, value }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-sm text-gray-700">{label}</span>
        <span className="font-serif-kr text-sm text-black">{value}</span>
      </div>
      <div className="h-2 w-full bg-gray-100">
        <div className="h-2 bg-black" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
