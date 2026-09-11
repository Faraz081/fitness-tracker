import { MACRO_TYPES } from '../../data/constants';

const COLORS = MACRO_TYPES.map((m) => m.color);

export function MacroDonut({ slices, total }) {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    let offset = 0;

    return (
        <div className="flex flex-col items-center">
            <svg viewBox="0 0 100 100" className="w-40" role="img" aria-label="Macro distribution: protein, carbs, fat">
                <circle cx="50" cy="50" r={radius} fill="none" stroke="var(--color-panel-soft)" strokeWidth="16" />
                {slices.map((s, i) => {
                    const len = circumference * (s.value / total);
                    const el = (
                        <circle
                            key={s.label}
                            cx="50"
                            cy="50"
                            r={radius}
                            fill="none"
                            stroke={COLORS[i % COLORS.length]}
                            strokeWidth="16"
                            strokeDasharray={`${len} ${circumference - len}`}
                            strokeDashoffset={-offset}
                            transform="rotate(-90 50 50)"
                        />
                    );
                    offset += len;
                    return el;
                })}
            </svg>
            <ul className="mt-3 w-full space-y-1 text-sm">
                {slices.map((s, i) => (
                    <li key={s.label} className="flex items-center justify-between gap-2 text-text-secondary">
                        <span className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                            {s.label}
                        </span>
                        <span>
                            <strong>{Math.round(s.value)}g</strong> ({Math.round((s.value / total) * 100)}%)
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}