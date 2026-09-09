import { formatVolume } from '../../utils/historyUtils';
import { formatWeight, weightUnitLabel } from '../../utils/units';
import { useSettings } from '../../context/SettingsContext';

export function ExerciseRow({ exercise, date }) {
    const { preferences } = useSettings();
    const units = preferences.units;
    const weight = Number(exercise?.weightKg);
    const hasWeight = weight > 0;
    const label = `${exercise.sets} × ${exercise.reps}`;

    return (
        <li className="flex items-center justify-between gap-3 py-3">
            <div className="min-w-0">
                <p className="truncate text-sm font-medium text-[var(--color-ink)]">
                    {exercise.name}
                </p>
                {date && (
                    <p className="text-xs text-[var(--color-ink-muted)]">
                        {new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                        })}
                    </p>
                )}
            </div>
            <div className="shrink-0 text-right">
                <p className="text-sm tabular-nums text-[var(--color-ink-soft)]">
                    {label} {hasWeight ? `@ ${formatWeight(weight, units)} ${weightUnitLabel(units)}` : '· Bodyweight'}
                </p>
                {hasWeight && (
                    <p className="text-xs tabular-nums text-[var(--color-ink-muted)]">
                        {formatVolume(exercise.sets * exercise.reps * weight, units)} volume
                    </p>
                )}
            </div>
        </li>
    );
}