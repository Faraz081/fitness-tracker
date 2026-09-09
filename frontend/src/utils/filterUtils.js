export function todayISO() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function dateFromKey(key) {
    const parts = String(key).split('-').map(Number);
    return new Date(parts[0], (parts[1] || 1) - 1, parts[2] || 1);
}

function startOfWeekMonday(base) {
    const d = new Date(base);
    const day = d.getDay();
    const diff = day === 0 ? 6 : day - 1;
    d.setDate(d.getDate() - diff);
    return d;
}

function firstOfMonthMonthsBack(base, months) {
    const d = new Date(base);
    d.setDate(1);
    d.setMonth(d.getMonth() - months);
    return d;
}

export function toLocalDateKey(isoLike) {
    const d = new Date(isoLike);
    if (Number.isNaN(d.getTime())) {
        return String(isoLike ?? '');
    }
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

export function matchesSearch(text, query) {
    if (!query) {
        return true;
    }
    return String(text ?? '').toLocaleLowerCase().includes(query.toLocaleLowerCase());
}

export function filterBySearch(items, query, textFor) {
    return items.filter((item) => matchesSearch(textFor(item), query));
}

export function filterByDateRange(items, { from, to } = {}, dateKey = 'date') {
    return items.filter((item) => {
        const date = item[dateKey];
        if (from && !(date >= from)) {
            return false;
        }
        if (to && !(date <= to)) {
            return false;
        }
        return true;
    });
}

function categoriesToSet(categories) {
    if (!categories || categories.length === 0 || categories.includes('all')) {
        return null;
    }
    return new Set(categories);
}

export function filterByCategory(items, categories, key = 'category') {
    const set = categoriesToSet(categories);
    if (!set) {
        return items;
    }
    return items.filter((item) => set.has(item[key]));
}

export function filterByMealType(items, mealTypes, key = 'mealType') {
    if (!mealTypes || mealTypes.length === 0) {
        return items;
    }
    return items.filter((item) => mealTypes.includes(item[key]));
}

export function applyFilters(items, { search = '', textFor, from, to, dateKey = 'date', categories, categoryKey = 'category', mealTypes, mealKey = 'mealType' } = {}) {
    const categorySet = categoriesToSet(categories);
    const hasSearch = Boolean(search);
    const hasMeals = Boolean(mealTypes && mealTypes.length > 0);
    return items.filter((item) => {
        if (hasSearch && !matchesSearch(textFor ? textFor(item) : String(item), search)) {
            return false;
        }
        if (from && !(item[dateKey] >= from)) {
            return false;
        }
        if (to && !(item[dateKey] <= to)) {
            return false;
        }
        if (categorySet && !categorySet.has(item[categoryKey])) {
            return false;
        }
        if (hasMeals && !mealTypes.includes(item[mealKey])) {
            return false;
        }
        return true;
    });
}

export function resolveDateRange(option, { from = '', to = '' } = {}, today = todayISO()) {
    if (option === 'all') {
        return { from: undefined, to: undefined };
    }
    if (option === 'custom') {
        return { from: from || undefined, to: to || undefined };
    }
    if (option === 'week') {
        const start = startOfWeekMonday(dateFromKey(today));
        return { from: toLocalDateKey(start), to: today };
    }
    if (option === 'month') {
        return { from: `${today.slice(0, 8)}01`, to: today };
    }
    if (option === 'last3') {
        return { from: toLocalDateKey(firstOfMonthMonthsBack(dateFromKey(today), 3)), to: today };
    }
    if (option === 'last6') {
        return { from: toLocalDateKey(firstOfMonthMonthsBack(dateFromKey(today), 6)), to: today };
    }
    if (option === 'lastYear') {
        return { from: `${today.slice(0, 4)}-01-01`, to: today };
    }
    return { from: undefined, to: undefined };
}

export function hasActiveFilters(filters = {}) {
    if (typeof filters.search === 'string' && filters.search.trim() !== '') {
        return true;
    }
    if (filters.category && filters.category !== 'all') {
        return true;
    }
    if (filters.dateOption && filters.dateOption !== 'all') {
        if (filters.dateOption !== 'custom' || filters.from || filters.to) {
            return true;
        }
    }
    if (Array.isArray(filters.mealTypes) && filters.mealTypes.length > 0) {
        return true;
    }
    return false;
}

export function activeFilterCount(filters = {}) {
    let count = 0;
    if (typeof filters.search === 'string' && filters.search.trim() !== '') {
        count += 1;
    }
    if (filters.category && filters.category !== 'all') {
        count += 1;
    }
    if (filters.dateOption && filters.dateOption !== 'all') {
        if (filters.dateOption !== 'custom' || filters.from || filters.to) {
            count += 1;
        }
    }
    if (Array.isArray(filters.mealTypes) && filters.mealTypes.length > 0) {
        count += 1;
    }
    return count;
}

export function filtersToSearchParams(filters = {}, include = ['search', 'category', 'dateOption', 'from', 'to', 'mealTypes']) {
    const params = new URLSearchParams();
    if (include.includes('search') && typeof filters.search === 'string' && filters.search.trim() !== '') {
        params.set('search', filters.search.trim());
    }
    if (include.includes('category') && filters.category && filters.category !== 'all') {
        params.set('category', filters.category);
    }
    if (include.includes('dateOption') && filters.dateOption && filters.dateOption !== 'all') {
        const customNoBounds = filters.dateOption === 'custom' && !filters.from && !filters.to;
        if (!customNoBounds) {
            params.set('dateOption', filters.dateOption);
            if (include.includes('from') && filters.from) {
                params.set('from', filters.from);
            }
            if (include.includes('to') && filters.to) {
                params.set('to', filters.to);
            }
        }
    }
    if (include.includes('mealTypes') && Array.isArray(filters.mealTypes) && filters.mealTypes.length > 0) {
        params.set('mealTypes', filters.mealTypes.join(','));
    }
    return params;
}

const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;

export function parseSearchParams(params, defaults = {}, allowed = {}) {
    const out = { ...defaults };
    const search = params.get('search');
    if (typeof search === 'string') {
        out.search = search;
    }
    const category = params.get('category');
    if (category) {
        if (!allowed.category || allowed.category.includes(category)) {
            out.category = category;
        }
    }
    const dateOption = params.get('dateOption');
    if (dateOption) {
        if (!allowed.dateOption || allowed.dateOption.includes(dateOption)) {
            out.dateOption = dateOption;
        }
    }
    const from = params.get('from');
    if (from && DATE_KEY_RE.test(from)) {
        out.from = from;
    }
    const to = params.get('to');
    if (to && DATE_KEY_RE.test(to)) {
        out.to = to;
    }
    const mealTypes = params.get('mealTypes');
    if (mealTypes) {
        const parsed = mealTypes.split(',').map((v) => v.trim()).filter(Boolean);
        if (parsed.length > 0) {
            out.mealTypes = !allowed.mealType
                ? parsed
                : parsed.filter((v) => allowed.mealType.includes(v));
        }
    }
    return out;
}