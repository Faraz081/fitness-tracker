import { NavLink, useNavigate } from 'react-router-dom';
import { BarChart3, Bell, Dumbbell, History, LogOut, Salad, Settings, Target, TrendingUp, X } from 'lucide-react';
import { SIDEBAR_MENU } from '../../data/constants';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../context/NotificationsContext';

const menuIcons = {
    dashboard: Dumbbell,
    exercise: Dumbbell,
    nutrition: Salad,
    progress: TrendingUp,
    goals: Target,
    history: History,
    analytics: BarChart3,
    notifications: Bell,
    settings: Settings,
};

function Logo() {
    return (
        <div className="flex items-center gap-2.5 px-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-accent)] text-[var(--color-bg)]">
                <Dumbbell className="h-5 w-5" />
            </div>
            <span className="dash-num text-lg tracking-tight text-[var(--color-ink)]">FitTrack</span>
        </div>
    );
}

export function Sidebar({ open = false, onClose = () => {} }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { badgeLabel, unreadCount } = useNotifications();

    async function handleLogout() {
        await logout();
        navigate('/login', { replace: true });
    }

    return (
        <>
            <div className={`fixed inset-0 z-30 bg-black/60 lg:hidden ${open ? 'block' : 'hidden'}`} onClick={onClose} aria-hidden="true" />
            <aside
                className={`fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col bg-[var(--color-panel)] border-r border-[var(--color-line)] transition-transform duration-300 lg:translate-x-0 ${
                    open ? 'translate-x-0' : '-translate-x-full'
                }`}
                aria-label="Sidebar"
            >
                <div className="flex items-center justify-between h-16 px-4 border-b border-[var(--color-line)]">
                    <Logo />
                    <button type="button" onClick={onClose} className="lg:hidden rounded-lg p-1.5 text-[var(--color-ink-soft)] hover:bg-[var(--color-line)]" aria-label="Close menu">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <nav className="flex-1 space-y-1 overflow-y-auto p-3">
                    {SIDEBAR_MENU.map((item) => {
                        const Icon = menuIcons[item.key] || Dumbbell;
                        return (
                            <NavLink
                                key={item.key}
                                to={item.path}
                                onClick={onClose}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                                        isActive
                                            ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
                                            : 'text-[var(--color-ink-soft)] hover:bg-[var(--color-line)]/60 hover:text-[var(--color-ink)]'
                                    }`
                                }
                            >
                                <Icon className="h-5 w-5" />
                                <span>{item.label}</span>
                                {item.key === 'notifications' && unreadCount > 0 && (
                                    <span
                                        className="ml-auto rounded-full bg-[var(--color-accent)] px-2 py-0.5 text-xs font-semibold text-[var(--color-bg)]"
                                        aria-label={`${unreadCount} unread notifications`}
                                    >
                                        {badgeLabel}
                                    </span>
                                )}
                            </NavLink>
                        );
                    })}
                </nav>

                <div className="border-t border-[var(--color-line)] p-3">
                    <div className="flex items-center gap-3 rounded-xl p-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-accent)]/20 text-[var(--color-accent)]">
                            <span className="dash-num text-sm">AM</span>
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-[var(--color-ink)]">{user?.name}</p>
                            <p className="truncate text-xs text-[var(--color-ink-muted)]">{user?.email}</p>
                        </div>
                        <button type="button" onClick={() => void handleLogout()} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-[var(--color-ink-muted)] hover:bg-[var(--color-line)] hover:text-[var(--color-ink)]" aria-label="Log out">
                            <LogOut className="h-4 w-4" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
