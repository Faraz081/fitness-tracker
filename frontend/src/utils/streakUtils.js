const DAY_MS = 86400000;

function parseDay(iso) {
    const parts = iso.split('-').map(Number);
    return Date.UTC(parts[0], parts[1] - 1, parts[2]);
}

function diffDays(a, b) {
    return Math.round((parseDay(b) - parseDay(a)) / DAY_MS);
}

export function computeStreak(dates, { cadenceDays = 1 } = {}) {
    const unique = [...new Set((dates || []).filter(Boolean))].sort();
    if (unique.length === 0) {
        return { current: 0, best: 0, active: false };
    }

    let run = 1;
    let best = 1;
    for (let i = 1; i < unique.length; i++) {
        run = diffDays(unique[i - 1], unique[i]) <= cadenceDays ? run + 1 : 1;
        best = Math.max(best, run);
    }

    const today = new Date().toISOString().slice(0, 10);
    const last = unique[unique.length - 1];
    const active = diffDays(last, today) <= cadenceDays;

    let current = 0;
    if (active) {
        current = 1;
        for (let i = unique.length - 1; i > 0; i--) {
            if (diffDays(unique[i - 1], unique[i]) <= cadenceDays) {
                current += 1;
            } else {
                break;
            }
        }
    }

    return { current, best, active };
}