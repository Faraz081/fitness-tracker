import { WorkoutCard } from './WorkoutCard';
import { groupByDate } from '../../utils/historyUtils';

function formatDayLabel(isoDate) {
    return new Date(`${isoDate}T00:00:00`).toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

export function WorkoutHistoryList({ workouts }) {
    const groups = groupByDate(workouts);
    return (
        <div className="space-y-8">
            {groups.map((group) => (
                <section key={group.date}>
                    <div className="mb-3 flex items-center justify-between">
                        <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-muted">
                            {formatDayLabel(group.date)}
                        </h2>
                        <span className="text-xs text-ink-muted">
                            {group.workouts.length} {group.workouts.length === 1 ? 'workout' : 'workouts'}
                        </span>
                    </div>
                    <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
                        {group.workouts.map((w) => (
                            <WorkoutCard key={w.id} workout={w} />
                        ))}
                    </div>
                </section>
            ))}
        </div>
    );
}