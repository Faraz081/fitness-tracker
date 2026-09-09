import { Link } from 'react-router-dom';
import { CategoryBadge } from './CategoryBadge';
import { workoutVolume, formatVolume } from '../../utils/historyUtils';
import { Dumbbell } from 'lucide-react';

export function WorkoutCard({ workout }) {
    const volume = workoutVolume(workout);
    const exerciseCount = workout.exercises?.length || 0;
    return (
        <Link
            to={`/workouts/${workout.id}`}
            className="dash-card block p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-(--color-accent)/40"
        >
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h3 className="text-base font-semibold text-ink">
                        {workout.name}
                    </h3>
                    <p className="mt-0.5 text-xs text-ink-muted">
                        {workout.date}
                    </p>
                </div>
                <CategoryBadge category={workout.category} />
            </div>

            <div className="mt-4 flex items-center gap-4">
                <span className="inline-flex items-center gap-1.5 text-xs text-ink-soft">
                    <Dumbbell className="h-3.5 w-3.5 text-ink-muted" />
                    {exerciseCount} {exerciseCount === 1 ? 'exercise' : 'exercises'}
                </span>
                {volume > 0 && (
                    <span className="inline-flex items-center text-xs text-ink-soft">
                        <span className="dash-num">{formatVolume(volume)}</span>
                        <span className="ml-1 text-ink-muted">volume</span>
                    </span>
                )}
            </div>
        </Link>
    );
}