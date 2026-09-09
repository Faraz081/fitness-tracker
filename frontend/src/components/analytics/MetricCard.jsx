export function MetricCard({ label, value, unit, trend }) {
    return (
        <div className="dash-card p-4">
            <p className="truncate text-xs font-medium uppercase tracking-wider text-[var(--color-ink-muted)]">
                {label}
            </p>
            <p className="mt-1 flex items-baseline gap-1 dash-num text-xl text-[var(--color-ink)]">
                <span className="truncate">{value}</span>
                {unit && <span className="shrink-0 text-sm text-[var(--color-ink-muted)]">{unit}</span>}
            </p>
            {trend && <div className="mt-1.5">{trend}</div>}
        </div>
    );
}