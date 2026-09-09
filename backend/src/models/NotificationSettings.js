import { Schema, model } from 'mongoose';
import { NOTIFICATION_TYPES } from './Notification.js';
const typesShape = {};
for (const type of NOTIFICATION_TYPES) {
    typesShape[type] = { type: Boolean, default: true };
}
const notificationSettingsSchema = new Schema({
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    muted: { type: Boolean, default: false },
    types: { type: typesShape, default: () => ({}) },
}, { timestamps: true });
export const NotificationSettings = model('NotificationSettings', notificationSettingsSchema);