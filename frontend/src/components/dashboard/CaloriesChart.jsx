import { EmptyState } from '../ui';

export function CaloriesChart({ data }) {
    if (!data || data.length === 0) {
        return <EmptyState title="No calorie data" message="Your calorie trend will show here." />;
    }

    const width = 320;
    const height = 120;
    const pad = 8;
    const max = Math.max(...data.map((d) => d.value), 1);
    const stepX = (width - pad * 2) / (data.length - 1 || 1);
    const points = data.map((d, i) => {
        const x = pad + i * stepX;
        const y = height - pad - (d.value / max) * (height - pad * 2);
        return [x, y];
    });
    const line = points.map((p) => p.join(',')).join(' ');
    const area = `${pad},${height - pad} ${line} ${width - pad},${height - pad}`;

    return (
        <div>
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="Calories chart">
                <defs>
                    <linearGradient id="calArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
                    </linearGradient>
                </defs>
                <polygon points={area} fill="url(#calArea)" />
                <polyline points={line} fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinejoin="round" />
                {points.map(([x, y], i) => (
                    <circle key={i} cx={x} cy={y} r="3" fill="var(--color-bg)" stroke="var(--color-accent)" strokeWidth="2" />
                ))}
            </svg>
            <div className="mt-2 flex justify-between text-xs text-[var(--color-ink-muted)]">
                {data.map((d) => (
                    <span key={d.label}>{d.label}</span>
                ))}
            </div>
        </div>
    );
}
