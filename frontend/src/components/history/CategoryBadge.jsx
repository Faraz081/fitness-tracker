import { WORKOUT_CATEGORIES } from '../../data/constants';

const CATEGORY_STYLES = {
    strength: 'bg-[var(--color-accent)]/15 text-[var(--color-accent)] border-[var(--color-accent)]/30',
    cardio: 'bg-[var(--color-primary)]/15 text-[var(--color-primary-light)] border-[var(--color-primary)]/30',
    flexibility: 'bg-[var(--color-success)]/15 text-[var(--color-success)] border-[var(--color-success)]/30',
    hybrid: 'bg-[var(--color-ink)]/10 text-[var(--color-ink-soft)] border-[var(--color-ink)]/20',
    other: 'bg-[var(--color-ink-muted)]/15 text-[var(--color-ink-soft)] border-[var(--color-ink-muted)]/30',
};

export function categoryLabel(categoryKey) {
    const match = WORKOUT_CATEGORIES.find((c) => c.key === categoryKey);
    return match ? match.label : categoryKey;
}

export function CategoryBadge({ category }) {
    const style = CATEGORY_STYLES[category] || CATEGORY_STYLES.other;
    return (
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${style}`}>
            {categoryLabel(category)}
        </span>
    );
}