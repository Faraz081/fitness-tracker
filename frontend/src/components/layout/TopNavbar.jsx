import { NavLink } from 'react-router-dom';
import { Activity, Bell, Menu } from 'lucide-react';
import { NAV_TABS } from '../../data/constants';
import { useAuth } from '../../hooks/useAuth';

const implementedTabs = new Set(['dashboard', 'workouts', 'nutrition']);

export function TopNavbar({ onMenuClick = () => {} }) {
    const { user } = useAuth();
    const initials = user?.name
        ?.split(' ')
        .filter(Boolean)
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() ?? '';

    return (
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-[var(--color-line)] bg-[var(--color-bg)]/90 px-4 backdrop-blur">
            <button
                type="button"
                onClick={onMenuClick}
                className="rounded-lg p-2 text-[var(--color-ink-soft)] hover:bg-[var(--color-line)] lg:hidden"
                aria-label="Open menu"
            >
                <Menu className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 lg:hidden">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-accent)] text-[var(--color-bg)]">
                    <Activity className="h-4 w-4" />
                </div>
                <span className="dash-num text-base text-[var(--color-ink)]">Fitness Tracker</span>
            </div>

            <div className="hidden lg:flex items-center gap-2 text-sm font-medium text-[var(--color-ink-soft)]">
                <Activity className="h-5 w-5 text-[var(--color-accent)]" />
                <span className="dash-num text-lg text-[var(--color-ink)]">Fitness Tracker</span>
            </div>

            <nav className="mx-auto flex items-center gap-1 overflow-x-auto" aria-label="Primary">
                {NAV_TABS.map((tab) =>
                    implementedTabs.has(tab.key) ? (
                        <NavLink
                            key={tab.key}
                            to={tab.path}
                            className={({ isActive }) =>
                                `whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                                    isActive
                                        ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
                                        : 'text-[var(--color-ink-soft)] hover:bg-[var(--color-line)]/60 hover:text-[var(--color-ink)]'
                                }`
                            }
                        >
                            {tab.label}
                        </NavLink>
                    ) : (
                        <span
                            key={tab.key}
                            className="whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium text-[var(--color-ink-soft)]"
                        >
                            {tab.label}
                        </span>
                    )
                )}
            </nav>

            <div className="flex items-center gap-3">
                <button type="button" className="hidden sm:inline-flex rounded-lg p-2 text-[var(--color-ink-soft)] hover:bg-[var(--color-line)]" aria-label="Notifications">
                    <Bell className="h-5 w-5" />
                </button>
                <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-accent)]/20 text-[var(--color-accent)]">
                        <span className="dash-num text-sm">{initials}</span>
                    </div>
                    <span className="hidden md:block text-sm font-semibold text-[var(--color-ink)]">{user?.name}</span>
                </div>
            </div>
        </header>
    );
}
