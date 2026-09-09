import { Search, X } from 'lucide-react';
import { useId } from 'react';

export function SearchInput({ id, label, value, onChange, placeholder = '', className = '' }) {
    const autoId = useId();
    const inputId = id || autoId;
    return (
        <div className={className}>
            {label && (
                <label htmlFor={inputId} className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-[var(--color-ink-muted)]">
                    {label}
                </label>
            )}
            <div className="relative">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-ink-muted)]" />
                <input
                    id={inputId}
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    aria-label={label || placeholder}
                    className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-panel-soft)] py-2.5 pl-10 pr-10 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)] transition-colors focus:border-[var(--color-accent)] focus:outline-none"
                />
                {value && (
                    <button
                        type="button"
                        onClick={() => onChange('')}
                        aria-label="Clear search"
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[var(--color-ink-muted)] transition-colors hover:bg-[var(--color-line)] hover:text-[var(--color-ink)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>
        </div>
    );
}