import { Dumbbell, Activity, Flame, Utensils, Scale, TrendingUp, Gauge } from 'lucide-react';
import { SummaryCard } from './SummaryCard';

const summaryConfig = {
    workouts: { icon: Dumbbell },
    exercises: { icon: Activity },
    caloriesBurned: { icon: Flame, accent: 'text-[var(--color-warning)]' },
    caloriesConsumed: { icon: Utensils },
    volume: { icon: Gauge, accent: 'text-[var(--color-info,#60A5FA)]' },
    weight: { icon: Scale, accent: 'text-[var(--color-info,#60A5FA)]' },
    streak: { icon: TrendingUp, accent: 'text-[var(--color-success)]' },
};

export function SummaryCards({ items }) {
    if (!items || items.length === 0) {
        return null;
    }
    return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => {
                const cfg = summaryConfig[item.key] || {};
                return (
                    <SummaryCard
                        key={item.key}
                        label={item.label}
                        value={item.value}
                        unit={item.unit}
                        icon={cfg.icon}
                        accentClass={cfg.accent}
                    />
                );
            })}
        </div>
    );
}
