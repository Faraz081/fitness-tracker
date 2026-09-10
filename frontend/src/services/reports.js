import { apiGet } from './api.js';

function buildParams(from, to) {
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    const q = params.toString();
    return q ? `?${q}` : '';
}

export function getOverviewReport(from, to) {
    return apiGet(`/api/reports/overview${buildParams(from, to)}`);
}

export function getWorkoutReport(from, to) {
    return apiGet(`/api/reports/workout${buildParams(from, to)}`);
}

export function getNutritionReport(from, to) {
    return apiGet(`/api/reports/nutrition${buildParams(from, to)}`);
}

export function getProgressReport(from, to) {
    return apiGet(`/api/reports/progress${buildParams(from, to)}`);
}
