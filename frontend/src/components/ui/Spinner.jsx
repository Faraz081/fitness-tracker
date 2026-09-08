export function Spinner({ className = '' }) {
    return (
        <div className={`flex items-center justify-center ${className}`} role="status" aria-label="Loading">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-line)] border-t-[var(--color-accent)]" />
        </div>
    );
}
