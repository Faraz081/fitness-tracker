import { X } from 'lucide-react';

export function FilterChip({ label, onRemove }) {
    return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/15 px-3 py-1 text-xs font-medium text-[var(--color-accent)]">
            {label}
            <button
                type="button"
                onClick={onRemove}
                aria-label={`Remove ${label}`}
                className="rounded-full p-0.5 transition-colors hover:bg-[var(--color-accent)]/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
            >
                <X className="h-3 w-3" />
            </button>
        </span>
    );
}