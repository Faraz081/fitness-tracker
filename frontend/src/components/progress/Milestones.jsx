import { Check } from 'lucide-react';
import { progressPct, milestoneReached } from '../../utils/progressUtils';

export function Milestones({ goal }) {
    if (!goal.milestones || goal.milestones.length === 0) {
        return null;
    }

    const pct = progressPct(goal.currentValue, goal.targetValue);
    let blocked = false;

    return (
        <ul className="mt-4 space-y-2 border-t border-[var(--color-line)] pt-4">
            {goal.milestones.map((milestone) => {
                const reached = milestoneReached(milestone, pct) && !blocked;
                if (!reached) {
                    blocked = true;
                }
                return (
                    <li key={milestone.id} className="flex items-center gap-2 text-sm">
                        <span
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                                reached
                                    ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/20 text-[var(--color-accent)]'
                                    : 'border-[var(--color-line)] text-transparent'
                            }`}
                        >
                            <Check className="h-3 w-3" />
                        </span>
                        <span className={reached ? 'text-[var(--color-ink)]' : 'text-[var(--color-ink-muted)]'}>
                            {milestone.title}
                        </span>
                    </li>
                );
            })}
        </ul>
    );
}