import { Bell, BellRing, CheckCheck, Clock, Dumbbell, Salad, Target, Trash2, TrendingUp } from 'lucide-react';
import { formatRelativeTime } from '../../utils/notificationsUtils';
import { NOTIFICATION_TYPES } from '../../data/constants';

const typeIcons = {
    'workout-completion': Dumbbell,
    'goal-progress': TrendingUp,
    'goal-completed': Target,
    'workout-reminder': BellRing,
    'meal-reminder': Salad,
    'goal-reminder': Clock,
};

export function NotificationItem({ notification, onRead, onRemove }) {
    const Icon = typeIcons[notification.type] ?? Bell;
    const meta = NOTIFICATION_TYPES.find((type) => type.key === notification.type);
    const unread = !notification.read;

    return (
        <article
            className={`glass-elevated rounded-2xl p-4 flex items-start gap-3 transition-colors ${
                unread ? 'border-l-[3px] border-l-[var(--color-accent)] bg-[var(--color-accent)]/5' : ''
            }`}
        >
            <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                    unread
                        ? 'bg-[var(--color-accent)]/20 text-[var(--color-accent)]'
                        : 'bg-[var(--color-line)] text-[var(--color-ink-muted)]'
                }`}
                aria-hidden="true"
            >
                <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <p className={`text-sm font-semibold ${unread ? 'text-[var(--color-ink)]' : 'text-[var(--color-ink-soft)]'}`}>
                        {notification.title}
                    </p>
                    {unread && (
                        <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--color-accent)]" aria-label="Unread notification" />
                    )}
                </div>
                <p className="mt-0.5 text-sm text-[var(--color-ink-muted)]">{notification.body}</p>
                <div className="mt-2 flex items-center gap-2">
                    <span className="rounded-full bg-[var(--color-line)] px-2 py-0.5 text-xs font-medium text-[var(--color-ink-soft)]">
                        {meta?.label ?? notification.type}
                    </span>
                    <span className="text-xs text-[var(--color-ink-muted)]" aria-label="Notification time">
                        {formatRelativeTime(notification.createdAt)}
                    </span>
                </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
                {unread && (
                    <button
                        type="button"
                        onClick={() => onRead(notification.id)}
                        aria-label="Mark as read"
                        className="rounded-lg p-2 text-[var(--color-ink-soft)] transition-colors hover:bg-[var(--color-accent)]/15 hover:text-[var(--color-accent)]"
                    >
                        <CheckCheck className="h-4 w-4" />
                    </button>
                )}
                <button
                    type="button"
                    onClick={() => onRemove(notification.id)}
                    aria-label="Dismiss notification"
                    className="rounded-lg p-2 text-[var(--color-ink-soft)] transition-colors hover:bg-[var(--color-line)] hover:text-[var(--color-ink)]"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>
        </article>
    );
}