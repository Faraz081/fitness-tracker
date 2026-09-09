import { EmptyState } from '../ui';
import { useSettings } from '../../context/SettingsContext';
import { formatWeight, weightUnitLabel } from '../../utils/units';

function shortWeek(iso) {
    return iso.slice(5).replace('-', '/');
}

export function PerformanceChart({ data }) {
    const { preferences } = useSettings();
    const units = preferences.units;
    if (!data || data.length === 0) {
        return <EmptyState title="No performance data" message="Weekly workout volume will show here." />;
    }

    const max = Math.max(...data.map((d) => d.totalVolumeKg), 1);

    return (
        <div className="flex h-40 items-end justify-between gap-2">
            {data.map((d) => (
                <div key={d.id} className="flex flex-1 flex-col items-center gap-2">
                    <div className="flex h-32 w-full items-end">
                        <div
                            className="w-full rounded-t-md bg-[var(--color-accent)] transition-all duration-500"
                            style={{ height: `${(d.totalVolumeKg / max) * 100}%`, opacity: 0.85 }}
                            title={`${shortWeek(d.week)}: ${formatWeight(d.totalVolumeKg, units)} ${weightUnitLabel(units)} · ${d.sessions} sessions`}
                        />
                    </div>
                    <span className="text-xs text-[var(--color-ink-muted)]">{shortWeek(d.week)}</span>
                </div>
            ))}
        </div>
    );
}