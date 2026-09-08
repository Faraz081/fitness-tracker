import { ActivityRing } from './ActivityRing';
import { EmptyState } from '../ui';

export function ActivityRings({ items }) {
    if (!items || items.length === 0) {
        return (
            <div className="dash-card p-4">
                <EmptyState title="No activity data" message="Progress rings will appear once you have activity." />
            </div>
        );
    }
    return (
        <div className="flex flex-wrap items-center justify-around gap-6">
            {items.map((ring) => (
                <ActivityRing key={ring.key} label={ring.label} value={ring.value} max={ring.max} unit={ring.unit} />
            ))}
        </div>
    );
}
