import { WORKOUT_CATEGORIES } from '../../data/constants';
import { CalendarRange, ListFilter } from 'lucide-react';

function FieldLabel({ icon, children }) {
    return (
        <span className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-[var(--color-ink-muted)]">
            {icon}
            {children}
        </span>
    );
}

export function HistoryFilters({ filters, onChange, dateOptions }) {
    const update = (patch) => onChange({ ...filters, ...patch });

    const updateCategory = (value) => update({ category: value });
    const updateDateOption = (value) => update({ dateOption: value });
    const updateFrom = (value) => update({ from: value });
    const updateTo = (value) => update({ to: value });

    return (
        <div className="dash-card grid w-full gap-4 p-5 sm:grid-cols-2 lg:grid-cols-2">
            <div>
                <FieldLabel icon={<ListFilter className="h-3.5 w-3.5" />}>
                    Category
                </FieldLabel>
                <select
                    value={filters.category}
                    onChange={(e) => updateCategory(e.target.value)}
                    aria-label="Filter by category"
                    className="w-full cursor-pointer rounded-xl border border-[var(--color-line)] bg-[var(--color-panel-soft)] px-3.5 py-2.5 text-sm text-[var(--color-ink)] transition-colors focus:border-[var(--color-accent)] focus:outline-none"
                >
                    <option value="all">All categories</option>
                    {WORKOUT_CATEGORIES.map((c) => (
                        <option key={c.key} value={c.key}>
                            {c.label}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <FieldLabel icon={<CalendarRange className="h-3.5 w-3.5" />}>
                    Time Range
                </FieldLabel>
                <select
                    value={filters.dateOption}
                    onChange={(e) => updateDateOption(e.target.value)}
                    aria-label="Time range"
                    className="w-full cursor-pointer rounded-xl border border-[var(--color-line)] bg-[var(--color-panel-soft)] px-3.5 py-2.5 text-sm text-[var(--color-ink)] transition-colors focus:border-[var(--color-accent)] focus:outline-none"
                >
                    {dateOptions.map((o) => (
                        <option key={o.key} value={o.key}>
                            {o.label}
                        </option>
                    ))}
                </select>
            </div>

            {filters.dateOption === 'custom' && (
                <>
                    <div>
                        <FieldLabel icon={<CalendarRange className="h-3.5 w-3.5" />}>
                            From
                        </FieldLabel>
                        <input
                            type="date"
                            value={filters.from}
                            onChange={(e) => updateFrom(e.target.value)}
                            aria-label="From date"
                            className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-panel-soft)] px-3.5 py-2.5 text-sm text-[var(--color-ink)] transition-colors focus:border-[var(--color-accent)] focus:outline-none"
                        />
                    </div>
                    <div>
                        <FieldLabel icon={<CalendarRange className="h-3.5 w-3.5" />}>
                            To
                        </FieldLabel>
                        <input
                            type="date"
                            value={filters.to}
                            onChange={(e) => updateTo(e.target.value)}
                            aria-label="To date"
                            className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-panel-soft)] px-3.5 py-2.5 text-sm text-[var(--color-ink)] transition-colors focus:border-[var(--color-accent)] focus:outline-none"
                        />
                    </div>
                </>
            )}
        </div>
    );
}