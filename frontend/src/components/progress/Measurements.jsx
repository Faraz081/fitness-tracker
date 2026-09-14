import { useState } from 'react';
import { Plus, Ruler, Trash2, X } from 'lucide-react';
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

const initialValues = Object.fromEntries(MEASUREMENT_FIELDS.map((field) => [field.key, '']));

export function Measurements({ sessions, onAdd, onDelete, busy = false }) {
    const latest = latestSession(sessions);
    const [showForm, setShowForm] = useState(false);
    const [values, setValues] = useState(initialValues);

    function handleChange(fieldKey, value) {
        setValues((prev) => ({ ...prev, [fieldKey]: value }));
    }

    function handleSubmit(event) {
        event.preventDefault();
        if (busy) {
            return;
        }
        const payload = {};
        MEASUREMENT_FIELDS.forEach((field) => {
            const parsed = Number.parseFloat(values[field.key]);
            if (Number.isFinite(parsed) && parsed >= 0) {
                payload[field.key] = parsed;
            }
        });
        if (Object.keys(payload).length === 0) {
            return;
        }
        onAdd(payload);
        setValues(initialValues);
        setShowForm(false);
    }

    const sorted = (sessions || []).slice().sort((a, b) => (a.date < b.date ? 1 : -1));

    return (
        <div className="dash-card p-5">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="dash-num text-lg text-[var(--color-ink)]">Body Measurements</h2>
                <Ruler className="h-5 w-5 text-[var(--color-ink-muted)]" />
            </div>

            <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel-soft)] px-4 py-3">
                <span className="text-sm text-[var(--color-ink-muted)]">{latest ? 'Latest session' : 'No session logged'}</span>
                {latest ? (
                    <span className="text-xs text-[var(--color-ink-muted)]">{latest.date}</span>
                ) : null}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <button
                        type="button"
                        onClick={() => setShowForm((s) => !s)}
                        className="flex items-center gap-2 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel-soft)] px-3 py-2 text-sm font-medium text-[var(--color-ink)] transition-colors hover:border-[var(--color-accent)]/50 hover:bg-[var(--color-line)]/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                    >
                        {showForm ? <X className="h-4 w-4 text-[var(--color-accent)]" /> : <Plus className="h-4 w-4 text-[var(--color-accent)]" />}
                        {showForm ? 'Cancel' : 'Log measurements'}
                    </button>
                </div>
                {sorted.length > 1 && (
                    <span className="text-xs text-[var(--color-ink-muted)]">{sorted.length} sessions logged</span>
                )}
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-2 gap-3">
                    {MEASUREMENT_FIELDS.map((field) => (
                        <div key={field.key}>
                            <label htmlFor={`measured-${field.key}`} className="mb-1 block text-xs text-[var(--color-ink-muted)]">
                                {field.label} ({field.unit})
                            </label>
                            <input
                                id={`measured-${field.key}`}
                                type="number"
                                inputMode="decimal"
                                step="0.1"
                                min="0"
                                value={values[field.key]}
                                onChange={(event) => handleChange(field.key, event.target.value)}
                                className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-panel-soft)] px-3 py-2 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                            />
                        </div>
                    ))}
                    <div className="col-span-2 mt-1">
                        <button
                            type="submit"
                            disabled={busy || !MEASUREMENT_FIELDS.some((field) => {
                                const parsed = Number.parseFloat(values[field.key]);
                                return Number.isFinite(parsed) && parsed >= 0;
                            })}
                            className="w-full rounded-xl bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-[var(--color-bg)] transition-colors hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                        >
                            Save session
                        </button>
                    </div>
                </form>
            )}

            {!latest ? (
                <div className="mt-4">
                    <EmptyState title="No measurements yet" message="Logged measurements will appear here." />
                </div>
            ) : (
                <>
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

                    {sorted.length > 0 && (
                        <ul className="mt-4 divide-y divide-[var(--color-line)]">
                            {sorted.map((session) => (
                                <li key={session.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                                    <span className="text-[var(--color-ink-muted)]">{session.date}</span>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs text-[var(--color-ink-muted)]">
                                            {MEASUREMENT_FIELDS.map((field) => session[field.key]).filter((v) => v != null).length} fields
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => onDelete(session.id)}
                                            disabled={busy}
                                            aria-label={`Delete measurement session from ${session.date}`}
                                            className="rounded-lg p-1 text-[var(--color-ink-muted)] transition-colors hover:bg-[var(--color-line)] hover:text-[var(--color-error, #F87171)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </>
            )}
        </div>
    );
}