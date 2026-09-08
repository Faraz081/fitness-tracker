const STATUS_STYLES = {
    'on-track': 'bg-[var(--color-success)]/15 text-[var(--color-success)] border-[var(--color-success)]/30',
    completed: 'bg-[var(--color-accent)]/15 text-[var(--color-accent)] border-[var(--color-accent)]/30',
    missed: 'bg-[var(--color-warning)]/15 text-[var(--color-warning)] border-[var(--color-warning)]/30',
    'no-goal': 'bg-[var(--color-ink-muted)]/15 text-[var(--color-ink-soft)] border-[var(--color-ink-muted)]/30',
};

const STATUS_LABELS = {
    'on-track': 'On track',
    completed: 'Completed',
    missed: 'Missed',
    'no-goal': 'No goal set',
};

export function StatusBadge({ status }) {
    const style = STATUS_STYLES[status] || STATUS_STYLES['no-goal'];
    return (
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${style}`}>
            {STATUS_LABELS[status] || STATUS_LABELS['no-goal']}
        </span>
    );
}