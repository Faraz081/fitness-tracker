export function SettingsSections({ heading, description, children, danger = false }) {
    return (
        <section
            className={`glass-elevated rounded-2xl p-5 ${danger ? 'border border-[var(--color-error)]/40' : ''}`}
            aria-label={heading}
        >
            <h2 className="dash-num text-lg text-[var(--color-ink)]">{heading}</h2>
            {description && <p className="mt-1 text-sm text-[var(--color-ink-muted)]">{description}</p>}
            <div className="mt-4">{children}</div>
        </section>
    );
}