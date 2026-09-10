const WIDTH = 240;
const HEIGHT = 48;

export function Sparkline({ label, values }) {
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * WIDTH;
      const y = HEIGHT - ((v - min) / range) * HEIGHT;
      return `${x},${y}`;
    })
    .join(" ");
  const [lastX, lastY] = points.split(" ").at(-1).split(",");

  return (
    <div>
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-sm text-gray-700">{label}</span>
        <span className="font-serif-kr text-sm text-black">{values.at(-1)}</span>
      </div>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full h-12" preserveAspectRatio="none">
        <polyline points={points} fill="none" stroke="#000" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        <circle cx={lastX} cy={lastY} r="2.5" fill="#000" />
      </svg>
    </div>
  );
}
