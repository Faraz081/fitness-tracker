export function ReportCard({ title, children, className = '' }) {
    return (
        <div className={`bg-dark-800/60 border border-dark-600 rounded-2xl p-5 ${className}`}>
            {title && (
                <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">{title}</h3>
            )}
            {children}
        </div>
    );
}
