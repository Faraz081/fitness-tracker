import { useState } from 'react';
import { CheckCheck, Settings, Trash2 } from 'lucide-react';
import { useNotifications } from '../../context/NotificationsContext';
import { NotificationList } from './NotificationList';
import { NotificationSettings } from './NotificationSettings';
import { Spinner, EmptyState } from '../ui';
import { sortNewestFirst } from '../../utils/notificationsUtils';

const activeTabClass = 'bg-[var(--color-accent)] text-[var(--color-bg)]';
const inactiveTabClass = 'text-[var(--color-ink-soft)] hover:bg-[var(--color-line)]/60 hover:text-[var(--color-ink)]';

function PageHeading() {
    const dateLabel = new Date().toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
    return (
        <div>
            <p className="text-sm text-[var(--color-ink-muted)]">{dateLabel}</p>
            <h1 className="mt-1 dash-num text-2xl sm:text-3xl text-[var(--color-ink)]">Notifications</h1>
        </div>
    );
}

export function NotificationsPage() {
    const {
        notifications,
        settings,
        loading,
        error,
        unreadCount,
        markRead,
        markAllRead,
        remove,
        clearAll,
        toggleType,
        setMuted,
    } = useNotifications();
    const [tab, setTab] = useState('all');
    const [showSettings, setShowSettings] = useState(false);

    const visible = sortNewestFirst(notifications);
    const items = tab === 'unread' ? visible.filter((item) => !item.read) : visible;

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
                <PageHeading />
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        aria-label="Toggle notification settings"
                        onClick={() => setShowSettings((prev) => !prev)}
                        className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                            showSettings ? activeTabClass : inactiveTabClass
                        }`}
                    >
                        <Settings className="h-4 w-4" />
                        Settings
                    </button>
                    <button
                        type="button"
                        aria-label="Mark all notifications as read"
                        onClick={() => void markAllRead()}
                        disabled={unreadCount === 0}
                        className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-[var(--color-ink-soft)] transition-colors hover:bg-[var(--color-line)]/60 hover:text-[var(--color-ink)] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <CheckCheck className="h-4 w-4" />
                        Mark all as read
                    </button>
                    <button
                        type="button"
                        aria-label="Clear all notifications"
                        onClick={() => void clearAll()}
                        disabled={notifications.length === 0}
                        className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-[var(--color-ink-soft)] transition-colors hover:bg-[var(--color-line)]/60 hover:text-[var(--color-ink)] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <Trash2 className="h-4 w-4" />
                        Clear all
                    </button>
                </div>
            </div>

            {showSettings && (
                <NotificationSettings settings={settings} onChangeType={toggleType} onToggleMute={setMuted} />
            )}

            <div className="flex items-center gap-2">
                {[
                    { key: 'all', label: `All (${visible.length})` },
                    { key: 'unread', label: `Unread (${unreadCount})` },
                ].map((option) => (
                    <button
                        key={option.key}
                        type="button"
                        onClick={() => setTab(option.key)}
                        className={`rounded-xl px-3 py-1.5 text-sm font-medium transition-colors ${tab === option.key ? activeTabClass : inactiveTabClass}`}
                    >
                        {option.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="glass-elevated rounded-2xl p-10">
                    <Spinner />
                </div>
            ) : error ? (
                <div className="glass-elevated rounded-2xl">
                    <EmptyState
                        icon={<Trash2 className="h-6 w-6" />}
                        title="Could not load notifications"
                        message={error}
                    />
                </div>
            ) : items.length === 0 ? (
                <div className="glass-elevated rounded-2xl">
                    <EmptyState
                        icon={<CheckCheck className="h-6 w-6" />}
                        title={tab === 'unread' ? 'Nothing unread' : 'No notifications yet'}
                        message={
                            tab === 'unread'
                                ? 'You have read every notification. Check back after your next workout or meal.'
                                : 'Workout completions, goal updates, and reminders will appear here.'
                        }
                    />
                </div>
            ) : (
                <NotificationList items={items} onRead={markRead} onRemove={remove} />
            )}
        </div>
    );
}