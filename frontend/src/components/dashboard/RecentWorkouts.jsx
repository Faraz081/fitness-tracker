import { Dumbbell } from 'lucide-react';
import { EmptyState } from '../ui';

export function RecentWorkouts({ items }) {
    if (!items || items.length === 0) {
        return (
            <EmptyState
                icon={<Dumbbell className="h-7 w-7" />}
                title="No recent workouts"
                message="Your latest sessions will appear here."
            />
        );
    }
    return (
        <ul className="divide-y divide-[var(--color-line)]">
            {items.map((w) => (
                <li key={w.id} className="flex items-center gap-3 py-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-line)] text-[var(--color-accent)]">
                        <Dumbbell className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-[var(--color-ink)]">{w.name}</p>
                        <p className="truncate text-xs text-[var(--color-ink-muted)]">
                            {w.category} · {w.metric}
                        </p>
                    </div>
                    <span className="shrink-0 text-xs text-[var(--color-ink-muted)]">{w.date}</span>
                </li>
            ))}
        </ul>
    );
}
