interface TrendPoint {
  label: string;
  value: number; // 0-100
}

function buildSmoothPath(points: { x: number; y: number }[]) {
  if (points.length < 2) return '';
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const midX = (p0.x + p1.x) / 2;
    const midY = (p0.y + p1.y) / 2;
    d += ` Q ${p0.x} ${p0.y} ${midX} ${midY}`;
  }
  const last = points[points.length - 1];
  d += ` T ${last.x} ${last.y}`;
  return d;
}

export function AttendanceTrendChart({ data }: { data: TrendPoint[] }) {
  const width = 400;
  const height = 140;
  const paddingY = 14;

  const points = data.map((d, i) => ({
    x: data.length > 1 ? (i / (data.length - 1)) * width : width / 2,
    y: height - paddingY - (d.value / 100) * (height - paddingY * 2),
  }));

  const linePath = buildSmoothPath(points);
  const areaPath = points.length
    ? `${linePath} L ${width} ${height} L 0 ${height} Z`
    : '';

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="attendanceTrendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#800020" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#800020" stopOpacity="0" />
          </linearGradient>
        </defs>
        {areaPath && <path d={areaPath} fill="url(#attendanceTrendFill)" />}
        {linePath && (
          <path d={linePath} fill="none" stroke="#800020" strokeWidth="2.5" strokeLinecap="round" />
        )}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" className="fill-maroon-600" />
        ))}
      </svg>
      <div className="mt-2 flex justify-between text-xs text-ink-900/40">
        {data.map((d) => (
          <span key={d.label}>{d.label}</span>
        ))}
      </div>
    </div>
  );
}