import { UtensilsCrossed } from 'lucide-react';
import { Badge, EmptyState } from '../ui';
import { MEAL_ORDER, MEAL_META } from './MealTabs';

function formatServing(entry) {
    const { quantity, unit } = entry;
    if (quantity === undefined || quantity === null) {
        return '';
    }
    return `${quantity}${unit ?? ''}`;
}

function macroLine(entry) {
    return `${entry.calories} kcal · ${entry.protein}g P · ${entry.carbs}g C · ${entry.fat}g F`;
}

export function MealSection({ mealType, entries = [] }) {
    const meta = MEAL_META[mealType] ?? MEAL_META[MEAL_ORDER[0]];
    const Icon = meta.Icon;

    return (
        <section className="glass-elevated rounded-2xl overflow-hidden" aria-label={`${meta.label} foods`}>
            <div className="flex items-center gap-2 px-4 py-3 bg-dark-700/40 border-b border-white/5">
                <Icon className="h-4 w-4 text-primary" />
                <span className="text-sm font-bold">{meta.label}</span>
                <Badge color="neutral">{entries.length}</Badge>
            </div>
            {entries.length === 0 ? (
                <EmptyState
                    icon={<UtensilsCrossed className="h-6 w-6" />}
                    title={`No food logged for ${meta.label}`}
                    message="Use AI search above to find and add foods."
                />
            ) : (
                <ul className="divide-y divide-white/5">
                    {entries.map((entry) => (
                        <li key={entry.id} className="flex items-center gap-3 px-4 py-3">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-semibold">{entry.foodName}</span>
                                    {formatServing(entry) && (
                                        <span className="text-xs text-text-muted">{formatServing(entry)}</span>
                                    )}
                                </div>
                                <p className="text-xs text-text-muted mt-0.5">{macroLine(entry)}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}