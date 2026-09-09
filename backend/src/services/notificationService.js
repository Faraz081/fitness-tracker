import { Notification, NOTIFICATION_TYPES } from '../models/Notification.js';
import { NotificationSettings } from '../models/NotificationSettings.js';
import { Workout } from '../models/Workout.js';
import { Nutrition } from '../models/Nutrition.js';
import { AppError } from '../utils/apiError.js';

const DEFAULT_TYPES = Object.fromEntries(NOTIFICATION_TYPES.map((type) => [type, true]));
const GOAL_REMINDER_DAYS = 3;
const MEAL_WINDOWS = [
    { mealType: 'breakfast', startHour: 7, startMinute: 0, endHour: 11, endMinute: 0 },
    { mealType: 'lunch', startHour: 12, startMinute: 0, endHour: 15, endMinute: 0 },
    { mealType: 'dinner', startHour: 18, startMinute: 0, endHour: 23, endMinute: 0 },
];

const toNotification = (n) => ({
    id: String(n._id),
    type: n.type,
    title: n.title,
    body: n.body,
    entityId: n.entityId,
    read: n.read,
    createdAt: n.createdAt instanceof Date ? n.createdAt.toISOString() : new Date(n.createdAt).toISOString(),
});

const toSettings = (s) => ({
    muted: s.muted,
    types: { ...DEFAULT_TYPES, ...s.types },
});

const dayStartLocal = (deltaDays = 0) => {
    const now = new Date();
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + deltaDays);
    return d;
};

const ymd = (date) => {
    const d = date instanceof Date ? date : new Date(date);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mm}-${dd}`;
};

const parseDateOrNull = (value) => {
    if (!value) {
        return null;
    }
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
};

export async function getSettingsForUser(owner) {
    const existing = await NotificationSettings.findOne({ owner }).lean();
    if (existing) {
        return toSettings(existing);
    }
    return { muted: false, types: { ...DEFAULT_TYPES } };
}

export async function updateSettings(owner, patch) {
    const types = {};
    for (const type of NOTIFICATION_TYPES) {
        const next = patch.types?.[type];
        types[type] = typeof next === 'boolean' ? next : true;
    }
    const settings = await NotificationSettings.findOneAndUpdate(
        { owner },
        { $set: { muted: typeof patch.muted === 'boolean' ? patch.muted : false, types } },
        { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
    ).lean();
    return toSettings(settings);
}

async function isEnabled(owner, type) {
    const settings = await getSettingsForUser(owner);
    return !settings.muted && settings.types[type] !== false;
}

export async function ensureNotification(owner, data) {
    if (!(await isEnabled(owner, data.type))) {
        return null;
    }
    const existing = await Notification.findOne({ owner, eventKey: data.eventKey }).lean();
    if (existing) {
        return null;
    }
    try {
        const doc = await Notification.create({ owner, ...data });
        return toNotification(doc);
    }
    catch (err) {
        if (err && err.code === 11000) {
            return null;
        }
        throw err;
    }
}

export async function createWorkoutCompletion(owner, workout) {
    const date = parseDateOrNull(workout.date) ?? new Date();
    return ensureNotification(owner, {
        type: 'workout-completion',
        title: 'Workout completed',
        body: `${workout.title} · ${workout.category} · ${ymd(date)}`,
        entityId: `${workout.id}`,
        eventKey: `workout-completion:${workout.id}:${ymd(date)}`,
    });
}

export async function listNotifications(owner, unreadOnly) {
    const filter = { owner };
    if (unreadOnly) {
        filter.read = false;
    }
    const docs = await Notification.find(filter).sort({ createdAt: -1, _id: -1 }).lean();
    return docs.map(toNotification);
}

export async function markRead(owner, notificationId) {
    const doc = await Notification.findOneAndUpdate({ owner, _id: notificationId }, { $set: { read: true } }, { new: true }).lean();
    if (!doc) {
        throw new AppError(404, 'Notification not found', 'NOT_FOUND');
    }
    return toNotification(doc);
}

export async function markAllRead(owner) {
    const result = await Notification.updateMany({ owner, read: false }, { $set: { read: true } });
    return result.modifiedCount;
}

export async function remove(owner, notificationId) {
    const result = await Notification.deleteOne({ owner, _id: notificationId });
    if (result.deletedCount === 0) {
        throw new AppError(404, 'Notification not found', 'NOT_FOUND');
    }
}

export async function clearAll(owner) {
    const result = await Notification.deleteMany({ owner });
    return result.deletedCount;
}

export async function syncReminders(owner, goals) {
    const created = [];
    const todayStart = dayStartLocal(0);
    const todayEnd = dayStartLocal(1);
    const yesterdayStart = dayStartLocal(-7);
    const now = new Date();

    const [habitExists, loggedToday] = await Promise.all([
        Workout.exists({ owner, date: { $gte: yesterdayStart, $lt: todayStart } }),
        Workout.exists({ owner, date: { $gte: todayStart, $lt: todayEnd } }),
    ]);

    const canWorkoutRemind = habitExists && !loggedToday && now.getHours() >= 17;
    if (canWorkoutRemind) {
        const item = await ensureNotification(owner, {
            type: 'workout-reminder',
            title: 'Workout reminder',
            body: 'You have not logged a workout today. Consider a quick session to keep your streak.',
            entityId: 'today',
            eventKey: `workout-reminder:today:${ymd(todayStart)}`,
        });
        if (item) {
            created.push(item);
        }
    }

    const mealTypesToday = await Nutrition.find({ owner, date: { $gte: todayStart, $lt: todayEnd } }).distinct('mealType');
    const mealTypesSet = new Set(mealTypesToday);
    for (const window of MEAL_WINDOWS) {
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), window.startHour, window.startMinute, 0);
        const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), window.endHour, window.endMinute, 0);
        if (now < start || now > end || mealTypesSet.has(window.mealType)) {
            continue;
        }
        const item = await ensureNotification(owner, {
            type: 'meal-reminder',
            title: 'Meal reminder',
            body: `Log your ${window.mealType} to keep your nutrition tracking accurate.`,
            entityId: `meal-reminder:${window.mealType}`,
            eventKey: `meal-reminder:${window.mealType}:${ymd(todayStart)}`,
        });
        if (item) {
            created.push(item);
        }
    }

    if (Array.isArray(goals)) {
        const recent = ymd(dayStartLocal(-7));
        const inThreeDays = dayStartLocal(GOAL_REMINDER_DAYS + 1);
        for (const goal of goals) {
            if (!goal || !goal.id || !goal.title) {
                continue;
            }
            const completedAt = parseDateOrNull(goal.completedAt);
            if (completedAt) {
                const item = await ensureNotification(owner, {
                    type: 'goal-completed',
                    title: 'Goal completed',
                    body: `You achieved "${goal.title}". Great work!`,
                    entityId: `${goal.id}`,
                    eventKey: `goal-completed:${goal.id}:${ymd(completedAt)}`,
                });
                if (item) {
                    created.push(item);
                }
                continue;
            }
            const milestones = Array.isArray(goal.milestones) ? goal.milestones : [];
            for (const milestone of milestones) {
                const reachedAt = parseDateOrNull(milestone?.reachedAt);
                if (reachedAt && ymd(reachedAt) >= recent && ymd(reachedAt) <= ymd(todayStart)) {
                    const item = await ensureNotification(owner, {
                        type: 'goal-progress',
                        title: 'Goal progress',
                        body: `New milestone on "${goal.title}". Keep going!`,
                        entityId: `${goal.id}`,
                        eventKey: `goal-progress:${goal.id}:${ymd(reachedAt)}`,
                    });
                    if (item) {
                        created.push(item);
                    }
                }
            }
            const targetDate = parseDateOrNull(goal.targetDate);
            if (targetDate && targetDate >= todayStart && targetDate < inThreeDays) {
                const daysLeft = Math.ceil((targetDate.getTime() - now.getTime()) / 86400000);
                const item = await ensureNotification(owner, {
                    type: 'goal-reminder',
                    title: 'Goal reminder',
                    body: `"${goal.title}" is due soon — ${Math.max(daysLeft, 1)} day(s) left.`,
                    entityId: `${goal.id}`,
                    eventKey: `goal-reminder:${goal.id}:${ymd(todayStart)}`,
                });
                if (item) {
                    created.push(item);
                }
            }
        }
    }

    return { created };
}