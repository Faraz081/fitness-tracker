export function EmptyState({ icon, title, message, action }) {
    return (
        <div className="flex flex-col items-center justify-center text-center px-6 py-12">
            {icon && (
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-line)] text-[var(--color-ink-muted)]">
                    {icon}
                </div>
            )}
            {title && <p className="dash-num text-lg text-[var(--color-ink)]">{title}</p>}
            {message && <p className="mt-1 max-w-xs text-sm text-[var(--color-ink-muted)]">{message}</p>}
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
}
