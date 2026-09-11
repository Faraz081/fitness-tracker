export function Skeleton({ className = '' }) {
    return <div className={`skeleton min-h-[0.75rem] ${className}`} aria-hidden="true" />;
}

export function CardSkeleton() {
    return (
        <div className="card-base">
            <div className="flex items-start justify-between mb-3">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-4 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-1/2 mb-2" />
            <Skeleton className="h-3 w-2/3" />
        </div>
    );
}

export function ListSkeleton({ count = 3 }) {
    return (
        <div role="status" aria-label="Loading content" className="space-y-4">
            {Array.from({ length: count }).map((_, i) => (
                <CardSkeleton key={i} />
            ))}
        </div>
    );
}

export function FormSkeleton({ lines = 4 }) {
    return (
        <div role="status" aria-label="Loading form" className="space-y-4">
            {Array.from({ length: lines }).map((_, i) => (
                <div key={i}>
                    <Skeleton className="h-4 w-1/4 mb-2" />
                    <Skeleton className="h-10 w-full" />
                </div>
            ))}
            <Skeleton className="h-12 w-full" />
        </div>
    );
}