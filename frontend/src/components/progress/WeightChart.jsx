import { EmptyState } from '../ui';

function toKg(value) {
    return Number(value).toFixed(1);
}

export function WeightChart({ entries }) {
    const series = (entries || []).slice().sort((a, b) => (a.date < b.date ? -1 : 1));

    if (series.length === 0) {
        return <EmptyState title="No weight entries yet" message="Your weight trend will show here." />;
    }

    if (series.length === 1) {
        const entry = series[0];
        return (
            <div>
                <svg viewBox="0 0 320 100" className="w-full" role="img" aria-label="Weight chart with a single entry">
                    <circle cx="160" cy="50" r="10" fill="var(--color-accent)" opacity="0.25" />
                    <circle cx="160" cy="50" r="4" fill="var(--color-accent)" />
                </svg>
                <div className="mt-2 flex items-center justify-center gap-2">
                    <span className="dash-num text-[var(--color-ink)]">{toKg(entry.weightKg)} kg</span>
                    <span className="text-xs text-[var(--color-ink-muted)]">{entry.date}</span>
                </div>
            </div>
        );
    }

    const width = 320;
    const height = 110;
    const pad = 10;
    const weights = series.map((e) => e.weightKg);
    const lo = Math.max(0, Math.floor(Math.min(...weights) - 1));
    const hi = Math.ceil(Math.max(...weights) + 1);
    const span = hi - lo || 1;
    const stepX = (width - pad * 2) / (series.length - 1);

    const points = series.map((entry, i) => {
        const x = pad + i * stepX;
        const y = height - pad - ((entry.weightKg - lo) / span) * (height - pad * 2);
        return { x, y, entry };
    });
    const line = points.map((p) => `${p.x},${p.y}`).join(' ');
    const area = `${pad},${height - pad} ${line} ${width - pad},${height - pad}`;

    return (
        <div>
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="Weight chart">
                <defs>
                    <linearGradient id="weightArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
                    </linearGradient>
                </defs>
                <polygon points={area} fill="url(#weightArea)" />
                <polyline points={line} fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinejoin="round" />
                {points.map(({ x, y, entry }) => (
                    <circle key={entry.id} cx={x} cy={y} r="3" fill="var(--color-bg)" stroke="var(--color-accent)" strokeWidth="2">
                        <title>{`${entry.date}: ${toKg(entry.weightKg)} kg`}</title>
                    </circle>
                ))}
            </svg>
            <div className="mt-2 flex justify-between text-xs text-[var(--color-ink-muted)]">
                <span>{series[0].date}</span>
                <span>{series[series.length - 1].date}</span>
            </div>
        </div>
    );
}