import { CalendarCheck, Droplets, Flame } from 'lucide-react';

const ICONS = {
    workout: Flame,
    checkin: CalendarCheck,
    hydration: Droplets,
};

export function StreakStat({ streak }) {
    const Icon = ICONS[streak.key] || Flame;
    const broken = streak.current === 0;

    return (
        <div className="dash-card flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-line)] text-[var(--color-accent)]">
                <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
                <p className="truncate text-sm font-medium text-[var(--color-ink)]">{streak.label}</p>
                {broken ? (
                    <p className="dash-num text-xl text-[var(--color-warning)]">0 days — start today</p>
                ) : (
                    <p className="dash-num text-xl text-[var(--color-ink)]">
                        {streak.current} <span className="text-sm font-normal text-[var(--color-ink-muted)]">{streak.unit}</span>
                    </p>
                )}
                <p className="text-xs text-[var(--color-ink-muted)]">Best: {streak.best}</p>
            </div>
        </div>
    );
}