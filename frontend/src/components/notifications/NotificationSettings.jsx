import { BellOff } from 'lucide-react';
import { NOTIFICATION_TYPES } from '../../data/constants';

export function NotificationSettings({ settings, onChangeType, onToggleMute }) {
    return (
        <section className="glass-elevated rounded-2xl p-5" aria-label="Notification settings">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h2 className="dash-num text-lg text-[var(--color-ink)]">Notification Settings</h2>
                    <p className="text-sm text-[var(--color-ink-muted)]">
                        Disabled types are never created. Settings apply immediately and are saved.
                    </p>
                </div>
                <label className="flex shrink-0 cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-[var(--color-ink-soft)]">
                    <BellOff className="h-4 w-4" />
                    <span>Mute all</span>
                    <input
                        type="checkbox"
                        checked={settings.muted === true}
                        onChange={(event) => onToggleMute(event.target.checked)}
                        className="h-5 w-5 rounded"
                        style={{ accentColor: 'var(--color-accent)' }}
                        aria-label="Mute all notifications"
                    />
                </label>
            </div>
            <div className="mt-4 divide-y divide-[var(--color-line)]">
                {NOTIFICATION_TYPES.map((type) => {
                    const enabled = settings.types?.[type.key] !== false;
                    return (
                        <label
                            key={type.key}
                            className="flex cursor-pointer items-center justify-between gap-3 py-3"
                        >
                            <span className="flex min-w-0 items-center gap-2">
                                <span className={`text-sm font-medium ${enabled ? 'text-[var(--color-ink)]' : 'text-[var(--color-ink-muted)]'}`}>
                                    {type.label}
                                </span>
                                {settings.muted && (
                                    <span className="rounded-full bg-[var(--color-line)] px-2 py-0.5 text-xs text-[var(--color-ink-muted)]">
                                        muted
                                    </span>
                                )}
                            </span>
                            <input
                                type="checkbox"
                                checked={enabled}
                                onChange={() => onChangeType(type.key)}
                                disabled={settings.muted === true}
                                className="h-5 w-5 rounded disabled:cursor-not-allowed"
                                style={{ accentColor: 'var(--color-accent)' }}
                                aria-label={`Enable ${type.label} notifications`}
                            />
                        </label>
                    );
                })}
            </div>
        </section>
    );
}