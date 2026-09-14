import { Coffee, Sun, Moon, Clock } from 'lucide-react';

export const MEAL_ORDER = ['breakfast', 'lunch', 'dinner', 'snack'];

export const MEAL_META = {
    breakfast: { label: 'Breakfast', Icon: Coffee },
    lunch: { label: 'Lunch', Icon: Sun },
    dinner: { label: 'Dinner', Icon: Moon },
    snack: { label: 'Snacks', Icon: Clock },
};

export function MealTabs({ active, onChange }) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6" role="tablist" aria-label="Meals">
            {MEAL_ORDER.map((mealType) => {
                const meta = MEAL_META[mealType];
                const isActive = active === mealType;
                return (
                    <button
                        key={mealType}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        aria-pressed={isActive}
                        onClick={() => onChange(mealType)}
                        className={
                            isActive
                                ? 'inline-flex items-center justify-center gap-1.5 rounded-xl bg-[var(--color-accent)] px-3 py-2.5 text-sm font-bold text-[var(--color-bg)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]'
                                : 'inline-flex items-center justify-center gap-1.5 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel-soft)] px-3 py-2.5 text-sm font-medium text-[var(--color-ink-soft)] transition-colors hover:border-[var(--color-accent)]/40 hover:text-[var(--color-ink)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]'
                        }
                    >
                        <meta.Icon className="h-4 w-4" />
                        {meta.label}
                    </button>
                );
            })}
        </div>
    );
}