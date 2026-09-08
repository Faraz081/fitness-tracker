import { Link } from 'react-router-dom';
import { Plus, List, Utensils, Target } from 'lucide-react';

const actions = [
    { key: 'log', label: 'Log Workout', icon: Plus, path: '/workouts/new' },
    { key: 'workouts', label: 'View Workouts', icon: List, path: '/workouts' },
    { key: 'nutrition', label: 'Track Nutrition', icon: Utensils, path: '/nutrition' },
    { key: 'goals', label: 'Set Goals', icon: Target, path: '/profile' },
];

export function QuickActions() {
    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {actions.map((a) => {
                const Icon = a.icon;
                return (
                    <Link
                        key={a.key}
                        to={a.path}
                        className="flex items-center justify-center gap-2 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel-soft)] px-3 py-3 text-sm font-medium text-[var(--color-ink)] transition-colors hover:border-[var(--color-accent)]/50 hover:bg-[var(--color-line)]/40"
                    >
                        <Icon className="h-4 w-4 text-[var(--color-accent)]" />
                        <span>{a.label}</span>
                    </Link>
                );
            })}
        </div>
    );
}
