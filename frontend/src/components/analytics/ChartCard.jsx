import { Skeleton, EmptyState } from '../ui';

export function ChartCard({ title, caption, children, loading = false, error = false }) {
    let body;
    if (loading) {
        body = (
            <div className="space-y-3">
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-4 w-2/3" />
            </div>
        );
    } else if (error) {
        body = (
            <EmptyState
                title="Couldn't load this section"
                message="This section could not be loaded. Try again."
            />
        );
    } else {
        body = children;
    }

    return (
        <div className="dash-card p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <h2 className="dash-num text-lg text-[var(--color-ink)]">{title}</h2>
                    {caption && <p className="mt-0.5 truncate text-xs text-[var(--color-ink-muted)]">{caption}</p>}
                </div>
            </div>
            {body}
        </div>
    );
}