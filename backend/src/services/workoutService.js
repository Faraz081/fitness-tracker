import { Workout } from '../models/Workout.js';
import { AppError } from '../utils/apiError.js';
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
    createdAt: w.createdAt.toISOString(),
    updatedAt: w.updatedAt.toISOString(),
});
const notFound = () => {
    throw new AppError(404, 'Workout not found', 'NOT_FOUND');
};
export async function createWorkout(owner, input) {
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
