import { Schema, model } from 'mongoose';
export const NOTIFICATION_TYPES = [
    'workout-completion',
    'goal-progress',
    'goal-completed',
    'workout-reminder',
    'meal-reminder',
    'goal-reminder',
];
const notificationSchema = new Schema({
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, required: true, enum: NOTIFICATION_TYPES },
    title: { type: String, required: true, trim: true, maxlength: 100 },
    body: { type: String, required: true, trim: true, maxlength: 500 },
    entityId: { type: String, required: true, trim: true, maxlength: 200 },
    eventKey: { type: String, required: true, trim: true, maxlength: 300 },
    read: { type: Boolean, default: false },
}, { timestamps: true });
notificationSchema.index({ owner: 1, eventKey: 1 }, { unique: true });
notificationSchema.index({ owner: 1, read: 1, createdAt: -1 });
export const Notification = model('Notification', notificationSchema);