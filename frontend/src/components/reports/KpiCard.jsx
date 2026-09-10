import { Skeleton } from '../ui/Skeleton.jsx';

export function KpiCard({ label, value, subtitle, isLoading, className = '' }) {
    if (isLoading) {
        return (
            <div className={`bg-dark-800/60 border border-dark-600 rounded-2xl p-5 ${className}`}>
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-24 mb-1" />
                <Skeleton className="h-3 w-16" />
            </div>
        );
    }

    return (
        <div className={`bg-dark-800/60 border border-dark-600 rounded-2xl p-5 ${className}`}>
            <p className="text-xs font-medium text-text-secondary uppercase tracking-wider mb-1">{label}</p>
            <p className="text-2xl font-bold text-text-primary">
                {value != null ? value : <span className="text-sm text-text-secondary">No data</span>}
            </p>
            {subtitle && <p className="text-xs text-text-secondary mt-1">{subtitle}</p>}
        </div>
    );
}
