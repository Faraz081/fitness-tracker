export function sortNewestFirst(items) {
    return [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function unreadCount(items) {
    return items.reduce((count, item) => count + (item.read ? 0 : 1), 0);
}

export function badgeLabel(count) {
    return count > 99 ? '99+' : String(count);
}

export function formatRelativeTime(iso) {
    if (!iso) {
        return '';
    }
    const then = new Date(iso).getTime();
    if (Number.isNaN(then)) {
        return '';
    }
    const diffMs = Date.now() - then;
    const minute = 60000;
    const hour = 3600000;
    const day = 86400000;
    if (diffMs < minute) {
        return 'Just now';
    }
    if (diffMs < hour) {
        return `${Math.floor(diffMs / minute)}m ago`;
    }
    if (diffMs < day) {
        return `${Math.floor(diffMs / hour)}h ago`;
    }
    if (diffMs < 7 * day) {
        return `${Math.floor(diffMs / day)}d ago`;
    }
    return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}