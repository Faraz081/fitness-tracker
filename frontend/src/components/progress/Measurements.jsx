import { Ruler } from 'lucide-react';
import { EmptyState } from '../ui';
import { MEASUREMENT_FIELDS } from '../../data/constants';

function latestSession(sessions) {
    if (!sessions || sessions.length === 0) {
        return null;
    }
    return sessions.reduce((a, b) => (a.date > b.date ? a : b));
}

function toCm(value) {
    return Number(value).toFixed(1);
}

export function Measurements({ sessions }) {
    const latest = latestSession(sessions);

    return (
        <div className="dash-card p-5">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="dash-num text-lg text-[var(--color-ink)]">Body Measurements</h2>
                <Ruler className="h-5 w-5 text-[var(--color-ink-muted)]" />
            </div>

            {!latest ? (
                <EmptyState title="No measurements yet" message="Logged measurements will appear here." />
            ) : (
                <>
                    <div className="mb-4 flex items-center justify-between rounded-xl border border-[var(--color-line)] bg-[var(--color-panel-soft)] px-4 py-3">
                        <span className="text-sm text-[var(--color-ink-muted)]">Latest session</span>
                        <span className="text-xs text-[var(--color-ink-muted)]">{latest.date}</span>
                    </div>
                    <ul className="divide-y divide-[var(--color-line)]">
                        {MEASUREMENT_FIELDS.map((field) => {
                            const value = latest[field.key];
                            if (value == null) {
                                return null;
                            }
                            return (
                                <li key={field.key} className="flex items-center justify-between py-2.5 text-sm">
                                    <span className="text-[var(--color-ink)]">{field.label}</span>
                                    <span className="dash-num text-[var(--color-ink-muted)]">
                                        {toCm(value)} {field.unit}
                                    </span>
                                </li>
                            );
                        })}
                    </ul>
                </>
            )}
        </div>
    );
}