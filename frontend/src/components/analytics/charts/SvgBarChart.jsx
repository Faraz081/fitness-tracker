/**
 * SvgBarChart — pure render, interactive (per-bar <title> tooltips).
 * Single series (plain bars) or grouped side-by-side (current vs previous).
 * viewBox + w-full scales with card width (A9).
 */
export function SvgBarChart({ series = [], group = false, height = 220, ariaLabel = 'Analytics bar chart' }) {
    const list = series.filter((s) => s && Array.isArray(s.values) && s.values.length > 0);
    if (list.length === 0) {
        return null;
    }

    const width = 320;
    const padX = 10;
    const padTop = 12;
    const padBottom = 8;
    const maxLen = Math.max(...list.map((s) => s.values.length));
    const maxVal = Math.max(0, ...list.flatMap((s) => s.values.map((v) => Number(v.value))));
    const hi = maxVal > 0 ? maxVal : 1;
    const slot = (width - padX * 2) / maxLen;
    const plotLeft = padX;
    const plotRight = width - padX;
    const plotTop = padTop;
    const plotBottom = height - padBottom;
    const barW = group ? Math.min((slot / list.length) * 0.6, 14) : Math.min(slot * 0.55, 26);
    const yFor = (v) => plotBottom - (Number(v) / hi) * (plotBottom - plotTop);
    const xFor = (i) => plotLeft + slot * i + slot / 2;

    const renderBars = (s, groupIndex = 0) =>
        s.values
            .map((v, i) => {
                const offset = group ? (groupIndex - (list.length - 1) / 2) * barW : 0;
                const x = xFor(i) + offset - barW / 2;
                const y = yFor(v.value);
                return (
                    <rect key={`${i}-${s.label}`} x={x} y={y} width={barW} height={Math.max(0, plotBottom - y)} rx="2" fill={s.color} opacity="0.9">
                        <title>{`${group ? `${s.label} · ` : ''}${v['x-label']}: ${v.value}`}</title>
                    </rect>
                );
            });

    return (
        <div>
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label={ariaLabel}>
                {list.map((s, groupIndex) => (
                    <g key={s.label}>{renderBars(s, groupIndex)}</g>
                ))}
            </svg>
            {list[0].values.length > 0 && (
                <div className="mt-2 flex items-end justify-between gap-1 text-xs text-[var(--color-ink-muted)]">
                    {list[0].values.map((v, i) => (
                        <span key={i} className="truncate">
                            {v['x-label']}
                        </span>
                    ))}
                </div>
            )}
            {group && (
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                    {list.map((s) => (
                        <span key={s.label} className="inline-flex items-center gap-1.5 text-xs text-[var(--color-ink-muted)]">
                            <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: s.color }} />
                            {s.label}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}