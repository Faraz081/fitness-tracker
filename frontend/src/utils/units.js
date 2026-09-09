const KG_TO_LB = 2.20462;

export function kgToLb(kg) {
    return Number(kg) * KG_TO_LB;
}

export function lbToKg(lb) {
    return Number(lb) / KG_TO_LB;
}

export function toKg(value, units) {
    return units === 'lb' ? lbToKg(value) : Number(value);
}

export function formatWeight(value, units = 'kg') {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return '';
    const rounded = units === 'lb' ? Math.round(kgToLb(numeric) * 10) / 10 : Math.round(numeric * 10) / 10;
    return String(rounded);
}

export function displayWeight(value, units = 'kg') {
    const formatted = formatWeight(value, units);
    return formatted === '' ? null : Number(formatted);
}

export function weightUnitLabel(units = 'kg') {
    return units === 'lb' ? 'lb' : 'kg';
}