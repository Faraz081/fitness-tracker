import { ProgressBar } from '../ui';
import { StatusBadge } from './StatusBadge';
import { Milestones } from './Milestones';
import { progressPct, goalStatus } from '../../utils/progressUtils';

function formatValue(value) {
    if (value == null) {
        return '—';
    }
    return Number.isInteger(value) ? value.toLocaleString() : value.toFixed(1);
}

export function GoalCard({ goal }) {
    const pct = progressPct(goal.currentValue, goal.targetValue);
    const status = goalStatus(goal);
    const hasGoal = pct != null;

    return (
        <div className="dash-card flex flex-col p-5">
            <div className="mb-3 flex items-center justify-between gap-2">
                <span className="text-xs font-medium uppercase tracking-wider text-[var(--color-ink-muted)]">
                    {goal.category}
                </span>
                <StatusBadge status={hasGoal ? status : 'no-goal'} />
            </div>

            <h3 className="truncate text-base font-semibold text-[var(--color-ink)]">{goal.title}</h3>

            <div className="mt-4 flex items-center gap-3">
                <ProgressBar
                    value={hasGoal ? pct : 0}
                    max={100}
                    label={`${goal.title} progress`}
                    className="h-2 flex-1"
                />
                <span className="shrink-0 text-xs tabular-nums text-[var(--color-ink-muted)]">
                    {hasGoal ? `${pct}%` : '—'}
                </span>
            </div>

            <div className="mt-3 flex items-baseline justify-between">
                <p className="dash-num text-[var(--color-ink)]">
                    {formatValue(goal.currentValue)}
                    <span className="text-sm font-normal text-[var(--color-ink-muted)]">
                        {' '}of {formatValue(goal.targetValue)} {goal.unit}
                    </span>
                </p>
                <p className="text-xs text-[var(--color-ink-muted)]">Target: {goal.targetDate}</p>
            </div>

            {!hasGoal && (
                <p className="mt-2 text-xs text-[var(--color-ink-muted)]">No goal set for this target.</p>
            )}

            {goal.milestones?.length > 0 && <Milestones goal={goal} />}
        </div>
    );
}