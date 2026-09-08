import { ProgressBar } from '../ui';
import { EmptyState } from '../ui';

export function ProgressCard({ label, current, target, unit = '' }) {
    const hasTarget = target != null && target > 0;
    const currentText = typeof current === 'number' && !Number.isInteger(current) ? current.toFixed(1) : current;
    const targetText = typeof target === 'number' && !Number.isInteger(target) ? target.toFixed(1) : target;

    return (
        <div className="dash-card p-4">
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-[var(--color-ink)]">{label}</p>
                <p className="text-xs text-[var(--color-ink-muted)]">
                    {hasTarget ? `${currentText} / ${targetText} ${unit}` : 'No target'}
                </p>
            </div>
            <div className="mt-3 h-2">
                {hasTarget ? (
                    <ProgressBar value={current} max={target} label={label} className="h-2" />
                ) : (
                    <EmptyState title="No goal set" message={`Set a ${label.toLowerCase()} goal to track progress.`} />
                )}
            </div>
        </div>
    );
}
