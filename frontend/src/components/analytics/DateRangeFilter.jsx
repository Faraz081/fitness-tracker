import { ANALYTICS_PERIODS, WORKOUT_CATEGORIES } from '../../data/constants';
import { CalendarRange, ListFilter, RotateCcw } from 'lucide-react';

function FieldLabel({ icon, children }) {
    return (
        <span className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-[var(--color-ink-muted)]">
            {icon}
            {children}
        </span>
    );
}

const controlClass =
    'w-full cursor-pointer rounded-xl border border-[var(--color-line)] bg-[var(--color-panel-soft)] px-3.5 py-2.5 text-sm text-[var(--color-ink)] transition-colors focus:border-[var(--color-accent)] focus:outline-none';

export function DateRangeFilter({ period, onPeriod, from, onFrom, to, onTo, category, onCategory, onReset }) {
    const isDefault = period === 'last30' && category === 'all' && !from && !to;

    return (
        <div className="dash-card p-5">
            <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${period === 'custom' ? 'xl:grid-cols-4' : 'xl:grid-cols-2'}`}>
                <div>
                    <FieldLabel icon={<CalendarRange className="h-3.5 w-3.5" />}>
                        Period
                    </FieldLabel>
                    <select
                        value={period}
                        onChange={(e) => onPeriod(e.target.value)}
                        className={controlClass}
                        aria-label="Time period"
                    >
                        {ANALYTICS_PERIODS.map((p) => (
                            <option key={p.key} value={p.key}>
                                {p.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <FieldLabel icon={<ListFilter className="h-3.5 w-3.5" />}>
                        Category
                    </FieldLabel>
                    <select
                        value={category}
                        onChange={(e) => onCategory(e.target.value)}
                        className={controlClass}
                        aria-label="Category"
                    >
                        <option value="all">All categories</option>
                        {WORKOUT_CATEGORIES.map((c) => (
                            <option key={c.key} value={c.key}>
                                {c.label}
                            </option>
                        ))}
                    </select>
                </div>

                {period === 'custom' && (
                    <>
                        <div>
                            <FieldLabel icon={<CalendarRange className="h-3.5 w-3.5" />}>
                                From
                            </FieldLabel>
                            <input
                                type="date"
                                value={from}
                                onChange={(e) => onFrom(e.target.value)}
                                className={controlClass}
                                aria-label="From date"
                            />
                        </div>
                        <div>
                            <FieldLabel icon={<CalendarRange className="h-3.5 w-3.5" />}>
                                To
                            </FieldLabel>
                            <input
                                type="date"
                                value={to}
                                onChange={(e) => onTo(e.target.value)}
                                className={controlClass}
                                aria-label="To date"
                            />
                        </div>
                    </>
                )}
            </div>

            {!isDefault && (
                <button
                    type="button"
                    onClick={onReset}
                    className="mt-4 inline-flex items-center gap-2 rounded-lg border border-[var(--color-line)] px-3.5 py-2 text-sm font-medium text-[var(--color-ink-soft)] transition-colors hover:bg-[var(--color-line)]/60 hover:text-[var(--color-ink)]"
                >
                    <RotateCcw className="h-4 w-4" />
                    Reset filters
                </button>
            )}
        </div>
    );
}