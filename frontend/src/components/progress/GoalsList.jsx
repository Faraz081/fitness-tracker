import { Target } from 'lucide-react';
import { EmptyState } from '../ui';
import { GoalCard } from './GoalCard';

export function GoalsList({ goals, onEdit, onDelete, busy = false }) {
    if (!goals || goals.length === 0) {
        return (
            <div className="dash-card p-5">
                <EmptyState icon={<Target className="h-7 w-7" />} title="No goals yet" message="Personal goals will appear here." />
            </div>
        );
    }
    return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {goals.map((goal) => (
                <GoalCard key={goal.id} goal={goal} onEdit={onEdit} onDelete={onDelete} busy={busy} />
            ))}
        </div>
    );
}