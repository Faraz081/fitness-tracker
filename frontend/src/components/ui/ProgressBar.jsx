export function ProgressBar({ value = 0, max = 0, className = '', label = '' }) {
    const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
    return (
        <div className={`w-full ${className}`} role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
            <div className="h-full w-full rounded-full bg-[var(--color-line)] overflow-hidden">
                <div className="h-full rounded-full bg-[var(--color-accent)] transition-all duration-500" style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
}
