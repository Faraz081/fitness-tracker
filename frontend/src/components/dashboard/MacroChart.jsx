import { EmptyState } from '../ui';
import { MACRO_COLORS } from '../../data/constants';

export function MacroChart({ macros }) {
    if (!macros) {
        return <EmptyState title="No macro data" message="Your macro breakdown will show here." />;
    }

    const entries = [
        { label: 'Protein', value: macros.protein ?? 0 },
        { label: 'Carbs', value: macros.carbs ?? 0 },
        { label: 'Fat', value: macros.fat ?? 0 },
    ];
    const total = entries.reduce((sum, e) => sum + e.value, 0);

    if (total <= 0) {
        return <EmptyState title="No macro data" message="Log nutrition to see your breakdown." />;
    }

    const size = 140;
    const stroke = 16;
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    let cumulative = 0;

    return (
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-around">
            <svg width={size} height={size} role="img" aria-label="Macronutrient breakdown">
                <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
                    {entries.map((entry, i) => {
                        const fraction = entry.value / total;
                        const dash = fraction * circumference;
                        const start = cumulative * circumference;
                        cumulative += fraction;
                        return (
                            <circle
                                key={entry.label}
                                cx={size / 2}
                                cy={size / 2}
                                r={radius}
                                fill="none"
                                stroke={MACRO_COLORS[i]}
                                strokeWidth={stroke}
                                strokeDasharray={`${dash} ${circumference - dash}`}
                                strokeDashoffset={-start}
                            />
                        );
                    })}
                </g>
                <div />
            </svg>
            <div className="space-y-2">
                {entries.map((entry, i) => (
                    <div key={entry.label} className="flex items-center gap-2 text-sm">
                        <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: MACRO_COLORS[i] }} />
                        <span className="text-[var(--color-ink)]">{entry.label}</span>
                        <span className="text-[var(--color-ink-muted)]">
                            {entry.value}g · {Math.round((entry.value / total) * 100)}%
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
