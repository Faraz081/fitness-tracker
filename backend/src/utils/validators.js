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
export const workoutCreateSchema = z.object({
    title: z.string().trim().min(1).max(100),
    category: z.enum(['strength', 'cardio', 'flexibility', 'hybrid', 'other']),
    date: z.coerce.date().optional(),
    notes: z.string().trim().max(2000).optional(),
    exercises: exercisesSchema.optional(),
});
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
});
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
