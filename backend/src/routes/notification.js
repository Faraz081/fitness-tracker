import { Router } from 'express';
import {
    clearNotificationsHandler,
    getSettingsHandler,
    listNotificationsHandler,
    markAllReadHandler,
    markReadHandler,
    removeNotificationHandler,
    syncNotificationsHandler,
    updateSettingsHandler,
} from '../controllers/notification.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { notificationSettingsPatchSchema, notificationSyncSchema } from '../utils/validators.js';

export const notificationRouter = Router();
notificationRouter.use(authenticate);
notificationRouter.get('/', listNotificationsHandler);
notificationRouter.get('/settings', getSettingsHandler);
notificationRouter.patch('/settings', validate(notificationSettingsPatchSchema), updateSettingsHandler);
notificationRouter.post('/sync', validate(notificationSyncSchema), syncNotificationsHandler);
notificationRouter.post('/read-all', markAllReadHandler);
notificationRouter.patch('/:id', markReadHandler);
notificationRouter.delete('/:id', removeNotificationHandler);
notificationRouter.delete('/', clearNotificationsHandler);