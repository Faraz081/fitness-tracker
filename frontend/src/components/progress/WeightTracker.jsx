import { useState } from 'react';
import { Scale, Trash2 } from 'lucide-react';
import { EmptyState } from '../ui';
import { useSettings } from '../../context/SettingsContext';
import { formatWeight, lbToKg, weightUnitLabel } from '../../utils/units';

function latestEntry(entries) {
    if (!entries || entries.length === 0) {
        return null;
    }
    return entries.reduce((a, b) => (a.date > b.date ? a : b));
}

export function WeightTracker({ entries, onAdd, onDelete, busy = false }) {
    const { preferences } = useSettings();
    const units = preferences.units;
    const [value, setValue] = useState('');
    const parsed = Number.parseFloat(value);
    const valid = Number.isFinite(parsed) && parsed > 0;
    const latest = latestEntry(entries);
    const sorted = (entries || []).slice().sort((a, b) => (a.date < b.date ? 1 : -1));

    function handleSubmit(event) {
        event.preventDefault();
        if (!valid || busy) {
            return;
        }
        onAdd({ weightKg: units === 'lb' ? lbToKg(parsed) : parsed });
        setValue('');
    }

    return (
        <div className="dash-card p-5">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="dash-num text-lg text-[var(--color-ink)]">Weight Tracking</h2>
                <Scale className="h-5 w-5 text-[var(--color-ink-muted)]" />
            </div>

            <div className="flex items-end justify-between gap-4 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel-soft)] p-4">
                <div>
                    <p className="text-xs text-[var(--color-ink-muted)]">Latest Weight</p>
                    <p className="mt-1 dash-num text-3xl text-[var(--color-ink)]">
                        {latest ? `${formatWeight(latest.weightKg, units)} ${weightUnitLabel(units)}` : '—'}
                    </p>
                </div>
                {latest && <p className="pb-1 text-xs text-[var(--color-ink-muted)]">{latest.date}</p>}
            </div>

            <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
                <input
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    min="0.1"
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                    placeholder={units === 'lb' ? 'e.g. 173' : 'e.g. 78.5'}
                    aria-label={`New weight in ${weightUnitLabel(units)}`}
                    className="w-full min-w-0 flex-1 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel-soft)] px-3 py-2 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                />
                <button
                    type="submit"
                    disabled={!valid || busy}
                    className="shrink-0 rounded-xl bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-[var(--color-bg)] transition-colors hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                >
                    Log weight
                </button>
            </form>

            {sorted.length === 0 ? (
                <EmptyState title="No weight entries yet" message="Logged weights will appear here." />
            ) : (
                <ul className="mt-4 divide-y divide-[var(--color-line)]">
                    {sorted.map((entry) => (
                        <li key={entry.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                            <span className="text-[var(--color-ink-muted)]">{entry.date}</span>
                            <div className="flex items-center gap-3">
                                <span className="dash-num text-[var(--color-ink)]">{formatWeight(entry.weightKg, units)} {weightUnitLabel(units)}</span>
                                <button
                                    type="button"
                                    onClick={() => onDelete(entry.id)}
                                    disabled={busy}
                                    aria-label={`Delete weight entry from ${entry.date}`}
                                    className="rounded-lg p-1 text-[var(--color-ink-muted)] transition-colors hover:bg-[var(--color-line)] hover:text-[var(--color-error, #F87171)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}