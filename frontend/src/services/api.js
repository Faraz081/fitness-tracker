export class ApiError extends Error {
    code;
    status;
    constructor(message, code, status) {
        super(message);
        this.name = 'ApiError';
        this.code = code;
        this.status = status;
    }
}
const API_URL = import.meta.env.VITE_API_URL;
async function request(path, options = {}) {
    let res;
    try {
        res = await fetch(`${API_URL}${path}`, {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            ...options,
        });
    }
    catch {
        throw new ApiError('Network error — please check your connection', 'NETWORK_ERROR', 0);
    }
    if (res.status === 204) {
        return undefined;
    }
    let body = null;
    try {
        body = (await res.json());
    }
    catch {
        body = null;
    }
    if (!res.ok || !body || !body.success) {
        const error = body && 'error' in body && body.error ? body.error : null;
        const message = error?.message ?? `Request failed (${res.status})`;
        const code = error?.code ?? 'REQUEST_FAILED';
        throw new ApiError(message, code, res.status);
    }
    return body.data;
}
function apiPost(path, body) {
    return request(path, { method: 'POST', body: JSON.stringify(body) });
}
export function apiGet(path) {
    return request(path, { method: 'GET' });
}
export function register(name, email, password) {
    return apiPost('/api/auth/register', { name, email, password });
}
export function login(email, password) {
    return apiPost('/api/auth/login', { email, password });
}
export function getMe() {
    return apiGet('/api/auth/me');
}
export function logout() {
    return apiPost('/api/auth/logout', {});
}
function apiPatch(path, body) {
    return request(path, { method: 'PATCH', body: JSON.stringify(body) });
}
function apiDelete(path) {
    return request(path, { method: 'DELETE' });
}
export function getProfile() {
    return apiGet('/api/users/me');
}
export function updateProfile(patch) {
    return apiPatch('/api/users/me', patch);
}
export function getPreferences() {
    return apiGet('/api/users/me/preferences');
}
export function updatePreferences(patch) {
    return apiPatch('/api/users/me/preferences', patch);
}
export function changePassword({ currentPassword, newPassword }) {
    return apiPost('/api/auth/change-password', { currentPassword, newPassword });
}
export function deleteAccount({ email }) {
    return request('/api/auth/account', { method: 'DELETE', body: JSON.stringify({ email }) });
}
export function listWorkouts(category) {
    const query = category ? `?category=${encodeURIComponent(category)}` : '';
    return apiGet(`/api/workouts${query}`);
}
export function getWorkout(id) {
    return apiGet(`/api/workouts/${id}`);
}
export function createWorkout(payload) {
    return apiPost('/api/workouts', payload);
}
export function updateWorkout(id, payload) {
    return apiPatch(`/api/workouts/${id}`, payload);
}
export function deleteWorkout(id) {
    return apiDelete(`/api/workouts/${id}`);
}
export function listNutrition(filters) {
    const params = new URLSearchParams();
    if (filters?.date)
        params.set('date', filters.date);
    if (filters?.mealType)
        params.set('mealType', filters.mealType);
    const query = params.toString();
    return apiGet(`/api/nutrition${query ? `?${query}` : ''}`);
}
export function getNutritionEntry(id) {
    return apiGet(`/api/nutrition/${id}`);
}
export function createNutritionEntry(payload) {
    return apiPost('/api/nutrition', payload);
}
export function updateNutritionEntry(id, patch) {
    return apiPatch(`/api/nutrition/${id}`, patch);
}
export function deleteNutritionEntry(id) {
    return apiDelete(`/api/nutrition/${id}`);
}
export function getNutritionSummary(date) {
    return apiGet(`/api/nutrition/summary/daily${date ? `?date=${encodeURIComponent(date)}` : ''}`);
}
export function listNotifications(unreadOnly) {
    return apiGet(`/api/notifications${unreadOnly ? '?unread=1' : ''}`);
}
export function markNotificationRead(id) {
    return apiPatch(`/api/notifications/${id}`, { read: true });
}
export function markAllNotificationsRead() {
    return apiPost('/api/notifications/read-all', {});
}
export function deleteNotification(id) {
    return apiDelete(`/api/notifications/${id}`);
}
export function clearNotifications() {
    return apiDelete('/api/notifications');
}
export function getNotificationSettings() {
    return apiGet('/api/notifications/settings');
}
export function updateNotificationSettings(patch) {
    return apiPatch('/api/notifications/settings', patch);
}
export function syncNotifications(goals) {
    return apiPost('/api/notifications/sync', { goals });
}
