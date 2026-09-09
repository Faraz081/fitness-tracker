import { useId } from 'react';

/**
 * SvgLineChart — pure render, interactive (per-point <title> tooltips).
 * Handles 0 points (caller shows empty state), 1 point (marker),
 * and 2+ points (line). viewBox + w-full scales with card width (A9).
 */
export function SvgLineChart({ series = [], height = 220, area = true, guide = null, ariaLabel = 'Analytics line chart' }) {
    const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
    const list = series.filter((s) => s && Array.isArray(s.points) && s.points.length > 0);
    if (list.length === 0) {
        return null;
    }

    const width = 320;
    const padX = 10;
    const padTop = 12;
    const padBottom = 8;

    const allValues = list.flatMap((s) => s.points.map((p) => Number(p.value)));
    let lo = Math.min(...allValues);
    let hi = Math.max(...allValues);
    if (hi === lo) {
        lo -= Math.max(1, Math.abs(lo) * 0.1);
        hi += Math.max(1, Math.abs(hi) * 0.1);
    }
    const ySpan = hi - lo || 1;
    const maxLen = Math.max(...list.map((s) => s.points.length));
    const plotLeft = padX;
    const plotRight = width - padX;
    const plotTop = padTop;
    const plotBottom = height - padBottom;
    const xFor = (i) => (maxLen > 1 ? plotLeft + (i * (plotRight - plotLeft)) / (maxLen - 1) : (plotLeft + plotRight) / 2);
    const yFor = (v) => plotBottom - ((Number(v) - lo) / ySpan) * (plotBottom - plotTop);

    const showGuide =
        guide &&
        Number(guide.value) >= lo - ySpan * 0.1 &&
        Number(guide.value) <= hi + ySpan * 0.1
            ? guide
            : null;

    let lastLabel = null;
    for (const s of list) {
        const p = s.points[s.points.length - 1];
        if (p && p['x-label'] && (!lastLabel || p['x-label'] > lastLabel)) {
            lastLabel = p['x-label'];
        }
    }
    const firstLabel = list.find((s) => s.points.length > 0)?.points[0]?.['x-label'] ?? undefined;
    const gradId = (s) => `${uid}-${(s.key || s.label || 'series').replace(/\W/g, '')}`;

    return (
        <div>
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label={ariaLabel}>
                <defs>
                    {list.map((s) => (
                        <linearGradient key={s.key || s.label} id={gradId(s)} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={s.color} stopOpacity="0.35" />
                            <stop offset="100%" stopColor={s.color} stopOpacity="0" />
                        </linearGradient>
                    ))}
                </defs>
                {showGuide && (
                    <g>
                        <line
                            x1={plotLeft}
                            x2={plotRight}
                            y1={yFor(showGuide.value)}
                            y2={yFor(showGuide.value)}
                            stroke="var(--color-ink-muted)"
                            strokeWidth="1.5"
                            strokeDasharray="5 4"
                        />
                        <text x={plotRight} y={yFor(showGuide.value) - 4} textAnchor="end" fontSize="9" fill="var(--color-ink-muted)">
                            {showGuide.label}
                        </text>
                    </g>
                )}
                {list.map((s) => {
                    const pts = s.points.map((p, i) => ({ x: xFor(i), y: yFor(p.value), p }));
                    const line = pts.map((pt) => `${pt.x},${pt.y}`).join(' ');
                    const areaPath = pts.length > 1 ? `M${plotLeft},${plotBottom} L${line.split(' ').join(' L')} L${plotRight},${plotBottom} Z` : null;
                    return (
                        <g key={s.key || s.label}>
                            {area && areaPath && <path d={areaPath} fill={`url(#${gradId(s)})`} />}
                            {pts.length > 1 ? (
                                <polyline points={line} fill="none" stroke={s.color} strokeWidth="2" strokeLinejoin="round" />
                            ) : (
                                <circle cx={pts[0].x} cy={pts[0].y} r="4" fill="var(--color-bg)" stroke={s.color} strokeWidth="2" />
                            )}
                            {pts.map((pt, idx) => (
                                <circle key={idx} cx={pt.x} cy={pt.y} r="3" fill="var(--color-bg)" stroke={s.color} strokeWidth="2">
                                    <title>{`${pt.p['x-label'] || ''}: ${pt.p.value}${s.unit || ''}`}</title>
                                </circle>
                            ))}
                        </g>
                    );
                })}
            </svg>
            {(firstLabel || lastLabel) && (
                <div className="mt-2 flex items-center justify-between gap-2 text-xs text-[var(--color-ink-muted)]">
                    <span className="truncate">{firstLabel}</span>
                    <span className="truncate">{lastLabel}</span>
                </div>
            )}
        </div>
    );
}