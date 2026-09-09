import { FilterChip } from './FilterChip';

export function ActiveFilters({ chips = [], onClearAll, label = 'Active filters' }) {
    if (chips.length === 0) {
        return null;
    }
    return (
        <div className="mt-4" aria-live="polite">
            <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium uppercase tracking-wider text-[var(--color-ink-muted)]">{label}</span>
                {chips.map((chip) => (
                    <FilterChip key={chip.id} label={chip.label} onRemove={chip.onRemove} />
                ))}
            </div>
            <button
                type="button"
                onClick={onClearAll}
                className="mt-2 text-xs font-semibold text-[var(--color-accent)] transition-colors hover:text-[var(--color-ink)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
            >
                Clear all filters
            </button>
        </div>
    );
}