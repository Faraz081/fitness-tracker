import { z } from 'zod';
export const registerSchema = z.object({
    name: z.string().trim().min(1, { message: 'Name is required' }).max(100),
    email: z.string().trim().toLowerCase().email(),
    password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});
export const loginSchema = z.object({
    email: z.string().trim().toLowerCase().email(),
    password: z.string().min(1, { message: 'Password is required' }),
});
export const profileUpdateSchema = z
    .object({
    name: z.string().trim().min(1).max(100).optional(),
    bio: z.string().trim().max(500).optional(),
    age: z.number().int().min(13).max(120).optional(),
    weightKg: z.number().min(20).max(400).optional(),
    heightCm: z.number().min(60).max(280).optional(),
    goal: z.enum(['lose', 'maintain', 'gain', 'other']).optional(),
    fitnessLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    avatarUrl: z.string().trim().url().max(500).nullable().optional(),
})
    .strict()
    .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
});
export const exerciseSchema = z.object({
    name: z.string().trim().min(1).max(100),
    sets: z.number().int().min(1).max(50),
    reps: z.number().int().min(1).max(500),
    weightKg: z.number().min(0).max(1000).optional(),
    notes: z.string().trim().max(500).optional(),
    restTimeSec: z.number().int().min(0).max(600).optional(),
});
export const exercisesSchema = z.array(exerciseSchema);
export function isPastWorkoutDate(value) {
    if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
        return false;
    }
    const y = String(value.getUTCFullYear()).padStart(4, '0');
    const m = String(value.getUTCMonth() + 1).padStart(2, '0');
    const d = String(value.getUTCDate()).padStart(2, '0');
    const now = new Date();
    const todayY = String(now.getFullYear()).padStart(4, '0');
    const todayM = String(now.getMonth() + 1).padStart(2, '0');
    const todayD = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}` < `${todayY}-${todayM}-${todayD}`;
}
const PAST_DATE_MESSAGE = 'Workout date cannot be in the past. Choose today or a future date.';
function rejectPastWorkoutDate(value, ctx) {
    if (value !== undefined && isPastWorkoutDate(value)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['date'],
            message: PAST_DATE_MESSAGE,
        });
    }
}
export const workoutCreateSchema = z.object({
    title: z.string().trim().min(1).max(100),
    category: z.enum(['strength', 'cardio', 'flexibility', 'hybrid', 'other']),
    date: z.coerce.date().optional(),
    notes: z.string().trim().max(2000).optional(),
    exercises: exercisesSchema.optional(),
}).superRefine((data, ctx) => rejectPastWorkoutDate(data.date, ctx));
const DATE_LOCKED_MESSAGE = 'Workout date cannot be changed after creation.';
function rejectWorkoutDateChange(value, ctx) {
    if (value !== undefined) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['date'],
            message: DATE_LOCKED_MESSAGE,
        });
    }
}
export const workoutUpdateSchema = z
    .object({
    title: z.string().trim().min(1).max(100).optional(),
    category: z.enum(['strength', 'cardio', 'flexibility', 'hybrid', 'other']).optional(),
    date: z.coerce.date().optional(),
    notes: z.string().trim().max(2000).optional(),
    exercises: exercisesSchema.optional(),
})
    .strict()
    .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
})
    .superRefine((data, ctx) => rejectWorkoutDateChange(data.date, ctx));
export const mealTypeSchema = z.enum(['breakfast', 'lunch', 'dinner', 'snack']);
export const nutritionEntrySchema = z.object({
    foodName: z.string().trim().min(1).max(100),
    quantity: z.number().min(0.01).max(1000).optional(),
    unit: z.string().trim().min(1).max(20).optional(),
    calories: z.number().min(0).max(2000),
    protein: z.number().min(0).max(500).optional(),
    carbs: z.number().min(0).max(500).optional(),
    fat: z.number().min(0).max(500).optional(),
    mealType: mealTypeSchema,
    source: z.enum(['ai', 'manual']).optional(),
    date: z.coerce.date().optional(),
});
export const nutritionUpdateSchema = z
    .object({
    foodName: z.string().trim().min(1).max(100).optional(),
    quantity: z.number().min(0.01).max(1000).optional(),
    unit: z.string().trim().min(1).max(20).optional(),
    calories: z.number().min(0).max(2000).optional(),
    protein: z.number().min(0).max(500).optional(),
    carbs: z.number().min(0).max(500).optional(),
    fat: z.number().min(0).max(500).optional(),
    mealType: mealTypeSchema.optional(),
    date: z.coerce.date().optional(),
})
    .strict()
    .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
});
export const nutritionQuerySchema = z
    .object({
    mealType: mealTypeSchema.optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'date must be YYYY-MM-DD' }).optional(),
})
    .strict();
export const nutritionAnalyzeSchema = z
    .object({
    query: z.string().trim().min(1, { message: 'Food description is required' }).max(200),
    quantity: z.number().min(0.01).max(1000).optional(),
    unit: z.string().trim().min(1).max(20).optional(),
})
    .strict()
    .refine((data) => !(data.unit !== undefined && data.quantity === undefined), {
    message: 'unit requires quantity',
});
export const nutritionAnalyzeResultSchema = z.object({
    foodName: z.string().trim().min(1).max(100),
    quantity: z.number().min(0.01).max(1000),
    unit: z.string().trim().min(1).max(20).optional(),
    calories: z.number().min(0).max(2000),
    protein: z.number().min(0).max(500),
    carbs: z.number().min(0).max(500),
    fat: z.number().min(0).max(500),
    fiber: z.number().min(0).max(500).optional(),
    sugar: z.number().min(0).max(500).optional(),
    sodium: z.number().min(0).max(500).optional(),
});
const notificationTypeKeys = [
    'workout-completion',
    'goal-progress',
    'goal-completed',
    'workout-reminder',
    'meal-reminder',
    'goal-reminder',
];
export const notificationSettingsPatchSchema = z
    .object({
    muted: z.boolean().optional(),
    types: z
        .object(Object.fromEntries(notificationTypeKeys.map((key) => [key, z.boolean().optional()])))
        .optional(),
})
    .strict()
    .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
});
export const preferencesPatchSchema = z
    .object({
    units: z.enum(['kg', 'lb']).optional(),
    theme: z.enum(['dark', 'light']).optional(),
})
    .strict()
    .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
});
export const changePasswordSchema = z
    .object({
    currentPassword: z.string().min(1, { message: 'Current password is required' }),
    newPassword: z.string().min(6, { message: 'New password must be at least 6 characters' }),
})
    .strict();
export const deleteAccountSchema = z
    .object({
    email: z.string().trim().toLowerCase().email(),
})
    .strict();
const goalMilestoneSchema = z.object({
    id: z.string().trim().min(1).max(200).optional(),
    title: z.string().trim().min(1).max(200).optional(),
    threshold: z.number().optional(),
    reachedAt: z.string().optional(),
});
const goalSchema = z.object({
    id: z.string().trim().min(1).max(200),
    title: z.string().trim().min(1).max(200),
    targetDate: z.string().optional(),
    completedAt: z.string().optional(),
    milestones: z.array(goalMilestoneSchema).optional(),
});
export const notificationSyncSchema = z.object({
    goals: z.array(goalSchema).max(50).optional(),
});
export const reportQuerySchema = z
    .object({
    from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'from must be YYYY-MM-DD' }),
    to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'to must be YYYY-MM-DD' }),
})
    .strict()
    .refine((data) => data.from <= data.to, {
    message: 'from date must be before or equal to to date',
});
export const reportTypeSchema = z.enum(['overview', 'workout', 'nutrition', 'progress']);
const dateKeySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Date must be YYYY-MM-DD' });
export const weightCreateSchema = z.object({
    weightKg: z.number().min(20).max(400),
    date: dateKeySchema.optional(),
}).strict();
export const weightUpdateSchema = z
    .object({
    weightKg: z.number().min(20).max(400).optional(),
    date: dateKeySchema.optional(),
})
    .strict()
    .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
});
export const measurementCreateSchema = z
    .object({
    date: dateKeySchema.optional(),
    chestCm: z.number().min(0).max(300).optional(),
    waistCm: z.number().min(0).max(300).optional(),
    armsCm: z.number().min(0).max(200).optional(),
    hipsCm: z.number().min(0).max(300).optional(),
    thighsCm: z.number().min(0).max(200).optional(),
})
    .strict()
    .refine((data) => ['chestCm', 'waistCm', 'armsCm', 'hipsCm', 'thighsCm'].some((k) => data[k] != null), {
    message: 'Provide at least one measurement value',
});
export const measurementUpdateSchema = z
    .object({
    date: dateKeySchema.optional(),
    chestCm: z.number().min(0).max(300).optional(),
    waistCm: z.number().min(0).max(300).optional(),
    armsCm: z.number().min(0).max(200).optional(),
    hipsCm: z.number().min(0).max(300).optional(),
    thighsCm: z.number().min(0).max(200).optional(),
})
    .strict()
    .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
});
const goalMilestoneCreateSchema = z.object({
    title: z.string().trim().min(1).max(200),
    threshold: z.number().min(1).max(100),
});
export const goalCreateSchema = z
    .object({
    title: z.string().trim().min(1).max(200),
    category: z.enum(['strength', 'weight', 'endurance', 'habit']),
    targetValue: z.number().positive().max(100000),
    unit: z.enum(['kg', 'lb', 'km', 'mi', 'sessions', 'min', 'days']).default('kg'),
    startDate: dateKeySchema.optional(),
    targetDate: dateKeySchema.optional(),
    milestones: z.array(goalMilestoneCreateSchema).max(10).optional(),
})
    .strict();
export const goalUpdateSchema = z
    .object({
    title: z.string().trim().min(1).max(200).optional(),
    category: z.enum(['strength', 'weight', 'endurance', 'habit']).optional(),
    targetValue: z.number().positive().max(100000).optional(),
    unit: z.enum(['kg', 'lb', 'km', 'mi', 'sessions', 'min', 'days']).optional(),
    startDate: dateKeySchema.nullable().optional(),
    targetDate: dateKeySchema.nullable().optional(),
})
    .strict()
    .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
});
export const hydrationCreateSchema = z
    .object({
    amountMl: z.number().int().min(50).max(5000).optional(),
    date: dateKeySchema.optional(),
    note: z.string().trim().max(200).optional(),
})
    .strict();
