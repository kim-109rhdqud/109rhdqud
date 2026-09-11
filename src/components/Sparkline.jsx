import { useId } from "react";

const WIDTH = 240;
const HEIGHT = 48;

export function Sparkline({ label, values }) {
  const gradientId = useId();
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
  const areaPoints = `0,${HEIGHT} ${points} ${WIDTH},${HEIGHT}`;

  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-sm text-neutral-600">{label}</span>
        <span className="font-serif-kr text-sm text-neutral-900">{values.at(-1)}</span>
      </div>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full h-12" preserveAspectRatio="none">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="60%" stopColor="#d946ef" />
            <stop offset="100%" stopColor="#f43f5e" />
          </linearGradient>
          <linearGradient id={`${gradientId}-fill`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={areaPoints} fill={`url(#${gradientId}-fill)`} />
        <polyline
          points={points}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        <circle cx={lastX} cy={lastY} r="3" fill="#d946ef" stroke="white" strokeWidth="1.5" />
      </svg>
    </div>
  );
}
