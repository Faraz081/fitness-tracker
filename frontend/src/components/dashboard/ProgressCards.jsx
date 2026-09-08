import { ProgressCard } from './ProgressCard';
import { EmptyState } from '../ui';

export function ProgressCards({ items }) {
    if (!items || items.length === 0) {
        return (
            <div className="dash-card p-4">
                <EmptyState title="No goals yet" message="Daily goals will appear here." />
            </div>
        );
    }
    return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {items.map((g) => (
                <ProgressCard key={g.key} label={g.label} current={g.current} target={g.target} unit={g.unit} />
            ))}
        </div>
    );
}
