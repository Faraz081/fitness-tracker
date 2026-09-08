import { Droplets, Footprints, Flame, Moon, Scale, Dumbbell, Plus } from 'lucide-react';
import { QUICK_LOG_ITEMS } from '../../data/constants';

const quickIcons = {
    water: Droplets,
    steps: Footprints,
    calories: Flame,
    sleep: Moon,
    weight: Scale,
    workout: Dumbbell,
};

export function QuickLog() {
    return (
        <div className="dash-card p-5">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="dash-num text-lg text-[var(--color-ink)]">Quick Log</h2>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {QUICK_LOG_ITEMS.map((item) => {
                    const Icon = quickIcons[item.key] || Plus;
                    return (
                        <button
                            key={item.key}
                            type="button"
                            className="flex flex-col items-center gap-2 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel-soft)] px-3 py-4 text-sm font-medium text-[var(--color-ink)] transition-colors hover:border-[var(--color-accent)]/50 hover:bg-[var(--color-line)]/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                        >
                            <Icon className="h-5 w-5 text-[var(--color-accent)]" />
                            <span>{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
