export function progressPct(current, target) {
    if (current == null || target == null || target <= 0) {
        return null;
    }
    const pct = Math.round((current / target) * 100);
    return Math.max(0, Math.min(100, pct));
}

export function goalStatus(goal) {
    if (goal.completedAt || (goal.currentValue != null && goal.targetValue != null && goal.currentValue >= goal.targetValue)) {
        return 'completed';
    }
    if (goal.targetDate) {
        const today = new Date().toISOString().slice(0, 10);
        if (goal.targetDate < today) {
            return 'missed';
        }
    }
    return 'on-track';
}

export function milestoneReached(milestone, pct) {
    if (milestone.reachedAt) {
        return true;
    }
    return pct != null && pct >= milestone.threshold;
}