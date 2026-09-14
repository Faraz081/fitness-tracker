import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import * as api from '../services/api';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../hooks/useAuth';
import { ToastContainer } from '../components/ui';
import { unreadCount, badgeLabel } from '../utils/notificationsUtils';

const NotificationsContext = createContext(null);

const TOAST_KIND = {
    'workout-completion': 'success',
    'goal-progress': 'info',
    'goal-completed': 'success',
    'workout-reminder': 'info',
    'meal-reminder': 'info',
    'goal-reminder': 'info',
};

export function NotificationsProvider({ children }) {
    const { user } = useAuth();
    const { toasts, dismiss: dismissToast, show, success } = useToast();
    const [notifications, setNotifications] = useState([]);
    const [settings, setSettings] = useState({ muted: false, types: {} });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const knownIdsRef = useRef(new Set());

    const load = useCallback(
        async (opts = {}) => {
            try {
                const [list, nextSettings] = await Promise.all([
                    api.listNotifications(),
                    api.getNotificationSettings(),
                ]);
                setNotifications(list);
                setSettings(nextSettings);
                setError(null);
                if (!opts.silent && knownIdsRef.current.size > 0) {
                    for (const item of list) {
                        if (
                            !knownIdsRef.current.has(item.id)
                            && !nextSettings.muted
                            && nextSettings.types?.[item.type] !== false
                        ) {
                            const kind = TOAST_KIND[item.type] ?? 'info';
                            if (kind === 'success') {
                                success(item.title);
                            }
                            else {
                                show(kind, item.title);
                            }
                        }
                    }
                }
                knownIdsRef.current = new Set(list.map((item) => item.id));
            }
            catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load notifications');
            }
            finally {
                setLoading(false);
            }
        },
        [show, success],
    );

    const refresh = useCallback(() => load({ silent: false }), [load]);

    useEffect(() => {
        if (!user) {
            knownIdsRef.current = new Set();
            setNotifications([]);
            setSettings({ muted: false, types: {} });
            setLoading(false);
            setError(null);
            return;
        }
        setLoading(true);
        api.listNotifications()
            .then((list) => {
                knownIdsRef.current = new Set(list.map((item) => item.id));
                setNotifications(list);
                setError(null);
            })
            .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load notifications'))
            .finally(() => setLoading(false));
        api.getGoals()
            .then(({ goals }) => api.syncNotifications(goals ?? []))
            .catch(() => {});
        api.getNotificationSettings().then(setSettings).catch(() => {});
    }, [user]);

    async function markRead(id) {
        try {
            await api.markNotificationRead(id);
            setNotifications((prev) => prev.map((item) => (item.id === id ? { ...item, read: true } : item)));
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update notification');
        }
    }

    async function markAllRead() {
        try {
            await api.markAllNotificationsRead();
            setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update notifications');
        }
    }

    async function remove(id) {
        try {
            await api.deleteNotification(id);
            setNotifications((prev) => prev.filter((item) => item.id !== id));
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to remove notification');
        }
    }

    async function clearAll() {
        try {
            await api.clearNotifications();
            setNotifications([]);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to clear notifications');
        }
    }

    async function toggleType(key) {
        const nextTypes = { ...settings.types, [key]: !(settings.types?.[key] !== false) };
        setSettings({ ...settings, types: nextTypes });
        try {
            await api.updateNotificationSettings({ types: nextTypes });
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save settings');
        }
    }

    async function setMuted(muted) {
        setSettings({ ...settings, muted });
        try {
            await api.updateNotificationSettings({ muted });
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save settings');
        }
    }

    const value = {
        notifications,
        settings,
        loading,
        error,
        unreadCount: unreadCount(notifications),
        badgeLabel: badgeLabel(unreadCount(notifications)),
        refresh,
        markRead,
        markAllRead,
        remove,
        clearAll,
        toggleType,
        setMuted,
    };

    return (
        <NotificationsContext.Provider value={value}>
            {children}
            <ToastContainer toasts={toasts} onDismiss={dismissToast} />
        </NotificationsContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationsContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationsProvider');
    }
    return context;
}