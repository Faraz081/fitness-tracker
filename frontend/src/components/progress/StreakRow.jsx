import { Flame } from 'lucide-react';
import { EmptyState } from '../ui';
import { StreakStat } from './StreakStat';

export function StreakRow({ streaks, onHydrationLog = null, busy = false }) {
    if (!streaks || streaks.length === 0) {
        return (
            <div className="dash-card p-5">
                <EmptyState icon={<Flame className="h-7 w-7" />} title="No streak data yet" message="Your active streaks will appear here." />
            </div>
        );
    }
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {streaks.map((streak) => (
                <StreakStat
                    key={streak.key}
                    streak={streak}
                    onHydrationLog={streak.key === 'hydration' ? onHydrationLog : null}
                    busy={busy}
                />
            ))}
        </div>
    );
}