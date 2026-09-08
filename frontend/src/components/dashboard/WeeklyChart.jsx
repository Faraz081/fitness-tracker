import { EmptyState } from '../ui';

export function WeeklyChart({ data }) {
    if (!data || data.length === 0) {
        return <EmptyState title="No weekly data" message="Weekly workouts will show here." />;
    }
    const max = Math.max(...data.map((d) => d.value), 1);

    return (
        <div className="flex h-40 items-end justify-between gap-2">
            {data.map((d) => (
                <div key={d.day} className="flex flex-1 flex-col items-center gap-2">
                    <div className="flex h-32 w-full items-end">
                        <div
                            className="w-full rounded-t-md bg-[var(--color-accent)] transition-all duration-500"
                            style={{ height: `${(d.value / max) * 100}%`, opacity: 0.85 }}
                            title={`${d.day}: ${d.value}`}
                        />
                    </div>
                    <span className="text-xs text-[var(--color-ink-muted)]">{d.day}</span>
                </div>
            ))}
        </div>
    );
}
