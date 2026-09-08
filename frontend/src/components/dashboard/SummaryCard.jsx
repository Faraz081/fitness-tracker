export function SummaryCard({ label, value, unit = '', icon, accentClass = 'text-[var(--color-accent)]' }) {
    const display = typeof value === 'number' && !Number.isInteger(value) ? value.toFixed(1) : value?.toLocaleString?.() ?? value;
    return (
        <div className="dash-card p-4">
            <div className="flex items-start justify-between">
                <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-ink-muted)]">{label}</p>
                {icon && (
                    <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-line)] ${accentClass}`}>
                        {icon && <icon />}
                    </div>
                )}
            </div>
            <p className="mt-3 dash-num text-2xl text-[var(--color-ink)]">
                {display}
                {unit && <span className="ml-1 text-sm font-normal text-[var(--color-ink-muted)]">{unit}</span>}
            </p>
        </div>
    );
}
