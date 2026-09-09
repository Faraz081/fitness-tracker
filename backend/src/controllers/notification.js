import * as notificationService from '../services/notificationService.js';
import { success } from '../utils/response.js';

const getParam = (value) => {
    const id = Array.isArray(value) ? value[0] : value;
    return id ?? '';
};

export async function listNotificationsHandler(req, res) {
    const unread = req.query.unread === '1';
    const notifications = await notificationService.listNotifications(req.userId ?? '', unread);
    success(res, notifications);
}

export async function markReadHandler(req, res) {
    const notification = await notificationService.markRead(req.userId ?? '', getParam(req.params.id));
    success(res, notification);
}

export async function markAllReadHandler(req, res) {
    const count = await notificationService.markAllRead(req.userId ?? '');
    success(res, { count });
}

export async function removeNotificationHandler(req, res) {
    await notificationService.remove(req.userId ?? '', getParam(req.params.id));
    res.status(204).send();
}

export async function clearNotificationsHandler(req, res) {
    await notificationService.clearAll(req.userId ?? '');
    res.status(204).send();
}

export async function getSettingsHandler(req, res) {
    const settings = await notificationService.getSettingsForUser(req.userId ?? '');
    success(res, settings);
}

export async function updateSettingsHandler(req, res) {
    const settings = await notificationService.updateSettings(req.userId ?? '', req.body);
    success(res, settings);
}

export async function syncNotificationsHandler(req, res) {
    const goals = Array.isArray(req.body?.goals) ? req.body.goals : [];
    const result = await notificationService.syncReminders(req.userId ?? '', goals);
    success(res, result);
}