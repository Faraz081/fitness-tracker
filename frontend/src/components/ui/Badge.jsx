const colorClasses = {
    primary: 'bg-primary-50 text-primary border border-primary/30',
    success: 'bg-success/15 text-success border border-success/30',
    warning: 'bg-warning/15 text-warning border border-warning/30',
    error: 'bg-error/15 text-error border border-error/30',
    neutral: 'bg-dark-600 text-text-secondary border border-dark-400',
};
export function Badge({ children, color = 'neutral', className = '' }) {
    return (<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${colorClasses[color]} ${className}`}>
      {children}
    </span>);
}
