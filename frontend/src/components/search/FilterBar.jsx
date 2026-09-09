import { SlidersHorizontal } from 'lucide-react';

export function FilterBar({ title, children, collapsible = false, open = false, onToggle, activeCount = 0 }) {
    const controls = (
        <div className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    );
    return (
        <div className="dash-card p-5">
            {(title || collapsible) && (
                <div className="mb-4 flex items-center gap-3">
                    {title && <h2 className="dash-num text-sm text-[var(--color-ink)]">{title}</h2>}
                    {collapsible && (
                        <button
                            type="button"
                            onClick={onToggle}
                            aria-expanded={open}
                            className="ml-auto flex items-center gap-2 rounded-xl border border-[var(--color-line)] bg-[var(--color-panel-soft)] px-3.5 py-2 text-sm font-semibold text-[var(--color-ink)] transition-colors hover:border-[var(--color-accent)]/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] sm:hidden"
                        >
                            <SlidersHorizontal className="h-4 w-4" />
                            Filters
                            {activeCount > 0 && (
                                <span className="rounded-full bg-[var(--color-accent)]/20 px-2 py-0.5 text-xs font-semibold text-[var(--color-accent)]">
                                    {activeCount}
                                </span>
                            )}
                        </button>
                    )}
                </div>
            )}
            {collapsible ? (
                <div className={open ? 'grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3' : 'hidden w-full gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-3'}>
                    {children}
                </div>
            ) : (
                controls
            )}
        </div>
    );
}