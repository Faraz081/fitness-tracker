import { useNavigate } from 'react-router-dom';
import { Dumbbell, Utensils, Scale, TrendingUp, Activity, Plus } from 'lucide-react';

const quickItems = [
    { key: 'workout', label: 'Workout', icon: Dumbbell, path: '/workouts/new' },
    { key: 'nutrition', label: 'Nutrition', icon: Utensils, path: '/nutrition' },
    { key: 'weight', label: 'Weight', icon: Scale, path: '/progress' },
    { key: 'progress', label: 'Progress', icon: TrendingUp, path: '/progress' },
    { key: 'goals', label: 'Goals', icon: Activity, path: '/goals' },
];

export function QuickLog() {
    const navigate = useNavigate();

    return (
        <div className="dash-card p-5">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="dash-num text-lg text-[var(--color-ink)]">Quick Log</h2>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {quickItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.key}
                            type="button"
                            onClick={() => navigate(item.path)}
                            className="flex flex-col items-center gap-2 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel-soft)] px-3 py-4 text-sm font-medium text-[var(--color-ink)] transition-colors hover:border-[var(--color-accent)]/50 hover:bg-[var(--color-line)]/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                        >
                            <Icon className="h-5 w-5 text-[var(--color-accent)]" />
                            <span>{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
