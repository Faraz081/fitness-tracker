export function Section({ title, action, children, className = '' }) {
    return (
        <section className={`dash-card p-5 ${className}`}>
            <div className="mb-4 flex items-center justify-between">
                {title && <h2 className="dash-num text-lg text-[var(--color-ink)]">{title}</h2>}
                {action && <div>{action}</div>}
            </div>
            {children}
        </section>
    );
}
