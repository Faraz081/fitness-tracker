export function ActivityRing({ label, value, max, unit = '' }) {
    const size = 120;
    const stroke = 10;
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const pct = max > 0 ? Math.max(0, Math.min(1, value / max)) : 0;
    const offset = circumference * (1 - pct);

    return (
        <div className="flex flex-col items-center">
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} aria-hidden="true">
                    <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--color-line)" strokeWidth={stroke} />
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke="var(--color-accent)"
                        strokeWidth={stroke}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        transform={`rotate(-90 ${size / 2} ${size / 2})`}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="dash-num text-xl text-[var(--color-ink)]">
                        {max > 0 ? `${Math.round(pct * 100)}%` : '--'}
                    </span>
                    {unit && max > 0 && <span className="text-xs text-[var(--color-ink-muted)]">{unit}</span>}
                </div>
            </div>
            <p className="mt-2 text-sm font-medium text-[var(--color-ink-soft)]">{label}</p>
        </div>
    );
}
