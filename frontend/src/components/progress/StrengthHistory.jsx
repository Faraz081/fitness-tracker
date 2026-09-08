import { Trophy } from 'lucide-react';
import { EmptyState } from '../ui';

export function StrengthHistory({ records }) {
    if (!records || records.length === 0) {
        return <EmptyState icon={<Trophy className="h-7 w-7" />} title="No strength records yet" message="Your best lifts will appear here." />;
    }

    const sorted = records.slice().sort((a, b) => (a.date < b.date ? 1 : -1));

    return (
        <ul className="divide-y divide-[var(--color-line)]">
            {sorted.map((record) => (
                <li key={record.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-line)] text-[var(--color-accent)]">
                        <Trophy className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1 basis-40">
                        <p className="truncate text-sm font-medium text-[var(--color-ink)]">{record.exercise}</p>
                        <p className="text-xs text-[var(--color-ink-muted)]">
                            {record.sets} × {record.reps} · {record.date}
                        </p>
                    </div>
                    <span className="shrink-0 dash-num text-[var(--color-ink)]">{record.prKg} <span className="text-xs font-normal text-[var(--color-ink-muted)]">kg</span></span>
                </li>
            ))}
        </ul>
    );
}