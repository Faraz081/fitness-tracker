function addDaysToStart(dateStr, days) {
    const d = new Date(`${dateStr}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + days);
    return d.toISOString().split('T')[0];
}

export function shortDate(dateStr) {
    return new Date(`${dateStr}T00:00:00Z`).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC',
    });
}

function weekStart(dateStr) {
    const d = new Date(`${dateStr}T00:00:00Z`);
    const dow = (d.getUTCDay() + 6) % 7;
    d.setUTCDate(d.getUTCDate() - dow);
    return d.toISOString().split('T')[0];
}

function monthStart(dateStr) {
    return `${dateStr.slice(0, 7)}-01`;
}

function bucket(entries, mode) {
    const map = new Map();
    for (const e of entries) {
        const key = mode === 'daily' ? e.date : mode === 'weekly' ? weekStart(e.date) : monthStart(e.date);
        const entry = map.get(key) || { date: key, value: 0 };
        entry.value += e.value;
        map.set(key, entry);
    }
    return [...map.values()].sort((a, b) => a.date.localeCompare(b.date));
}

function autoBucket(entries) {
    if (!entries.length) return [];
    const dates = entries.map((e) => e.date).sort();
    const spanDays = Math.round((new Date(dates[dates.length - 1]) - new Date(dates[0])) / 86400000) + 1;
    const mode = spanDays <= 62 ? 'daily' : spanDays <= 434 ? 'weekly' : 'monthly';
    return bucket(entries, mode);
}

export function workoutVolumeSeries(workouts) {
    const byDay = new Map();
    for (const w of workouts) {
        const key = w.date;
        if (!byDay.has(key)) byDay.set(key, 0);
        byDay.set(key, byDay.get(key) + (w.volume || 0));
    }
    return autoBucket([...byDay].map(([date, value]) => ({ date, value })));
}

export function workoutFrequencySeries(frequencySeries) {
    return autoBucket((frequencySeries || []).map((f) => ({ date: f.date, value: f.count })));
}

export function categorySeries(categoryBreakdown) {
    return (categoryBreakdown || []).map((c) => ({ label: c.category, value: c.count }));
}

export function caloriesDailySeries(dailyTotals) {
    return autoBucket((dailyTotals || []).map((d) => ({ date: d.date, value: d.calories })));
}

export function macroSlices(summary) {
    return [
        { label: 'Protein', value: summary?.totalProtein || 0 },
        { label: 'Carbs', value: summary?.totalCarbs || 0 },
        { label: 'Fat', value: summary?.totalFat || 0 },
    ].filter((s) => s.value > 0);
}

export function strengthSeriesWithColor(series, palette) {
    return (series || [])
        .filter((s) => s.points && s.points.length > 0)
        .map((s, i) => ({
            key: s.exercise,
            label: s.exercise,
            color: palette[i % palette.length],
            unit: ' kg',
            points: s.points.map((p) => ({ value: p.weight, 'x-label': p.date })),
        }));
}

export { addDaysToStart, autoBucket };