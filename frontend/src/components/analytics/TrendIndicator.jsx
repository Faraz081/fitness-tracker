/**
 * TrendIndicator
 *
 * Direction is always conveyed by BOTH an arrow glyph and text (never color-only).
 * Color semantics (no new meanings beyond accent / muted / red):
 *  - flat            -> muted
 *  - neutral context -> up/positive = accent (green); down = muted
 *  - weight context  -> down = accent (weight loss is positive); up = muted
 *  - calories/surplus-> down (lower intake) = accent; up (surplus) = red
 */
export function TrendIndicator({ direction = 'auto', delta, context = 'neutral', invert = false }) {
    const numeric = Number(delta);
    const hasNumeric = Number.isFinite(numeric);
    let dir = direction;
    if (dir === 'auto' || !dir) {
        dir = hasNumeric && numeric > 0 ? 'up' : hasNumeric && numeric < 0 ? 'down' : 'flat';
    }
    const positiveDirection = context === 'weight' || context === 'calories' || invert ? 'down' : 'up';
    const isPositiveMove = dir === positiveDirection;

    const arrow = dir === 'flat' ? '•' : dir === 'up' ? '▲' : '▼';
    const color =
        dir === 'flat'
            ? 'text-[var(--color-ink-muted)]'
            : context === 'calories' || context === 'surplus'
                ? isPositiveMove
                    ? 'text-[var(--color-accent)]'
                    : 'text-[#F87171]'
                : isPositiveMove
                    ? 'text-[var(--color-accent)]'
                    : 'text-[var(--color-ink-muted)]';

    const label =
        delta === null || delta === undefined
            ? ''
            : typeof delta === 'number'
                ? hasNumeric
                    ? (numeric > 0 ? '+' : numeric < 0 ? '−' : '') + Math.abs(Math.round(numeric * 10) / 10)
                    : String(delta)
                : delta;

    return (
        <span className={`inline-flex items-center gap-1 text-xs font-medium ${color}`}>
            <span aria-hidden="true" className="text-[10px] leading-none">
                {arrow}
            </span>
            <span className="truncate">{label}</span>
        </span>
    );
}