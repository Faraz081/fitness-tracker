import { Workout } from '../models/Workout.js';
import { AppError } from '../utils/apiError.js';
import { isPastWorkoutDate } from '../utils/validators.js';
const formatExercise = (ex) => ({
    name: ex.name,
    sets: ex.sets,
    reps: ex.reps,
    weightKg: ex.weightKg ?? null,
    notes: ex.notes ?? null,
    restTimeSec: ex.restTimeSec ?? null,
});
const toWorkout = (w) => ({
    id: String(w._id),
    owner: String(w.owner),
    title: w.title,
    category: w.category,
    date: new Date(w.date).toISOString(),
    notes: w.notes ?? null,
    exercises: w.exercises.map(formatExercise),
    completed: Boolean(w.completed),
    completedAt: w.completedAt instanceof Date ? w.completedAt.toISOString() : w.completedAt ? new Date(w.completedAt).toISOString() : null,
    createdAt: w.createdAt.toISOString(),
    updatedAt: w.updatedAt.toISOString(),
});
const notFound = () => {
    throw new AppError(404, 'Workout not found', 'NOT_FOUND');
};
const rejectPastDate = (date) => {
    if (date !== undefined && isPastWorkoutDate(date)) {
        throw new AppError(400, 'Workout date cannot be in the past. Choose today or a future date.', 'PAST_DATE');
    }
};
const rejectDateChange = (patch) => {
    if (patch.date !== undefined) {
        throw new AppError(400, 'Workout date cannot be changed after creation.', 'DATE_LOCKED');
    }
};
export async function createWorkout(owner, input) {
    rejectPastDate(input.date);
    const workout = await Workout.create({
        owner,
        title: input.title,
        category: input.category,
        date: input.date ?? new Date(),
        notes: input.notes,
        exercises: input.exercises ?? [],
    });
    const doc = workout;
    return toWorkout(doc);
}
export async function listWorkouts(owner, category) {
    const filter = { owner };
    if (category) {
        filter.category = category;
    }
    const workouts = await Workout.find(filter).sort({ date: -1, createdAt: -1 }).lean();
    return workouts.map(toWorkout);
}
export async function getWorkout(owner, workoutId) {
    const workout = await Workout.findOne({ owner, _id: workoutId }).lean();
    if (!workout) {
        return notFound();
    }
    return toWorkout(workout);
}
export async function updateWorkout(owner, workoutId, patch) {
    rejectDateChange(patch);
    const workout = await Workout.findOneAndUpdate({ owner, _id: workoutId }, { $set: patch }, { new: true, runValidators: true }).lean();
    if (!workout) {
        return notFound();
    }
    return toWorkout(workout);
}
export async function deleteWorkout(owner, workoutId) {
    const result = await Workout.deleteOne({ owner, _id: workoutId });
    if (result.deletedCount === 0) {
        notFound();
    }
}
export async function completeWorkout(owner, workoutId) {
    const workout = await Workout.findOne({ owner, _id: workoutId }).lean();
    if (!workout) {
        return notFound();
    }
    if (workout.completed) {
        return toWorkout(workout);
    }
    const updated = await Workout.findOneAndUpdate(
        { owner, _id: workoutId },
        { $set: { completed: true, completedAt: new Date() } },
        { new: true, runValidators: true },
    ).lean();
    return toWorkout(updated);
}
