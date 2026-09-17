import * as workoutService from '../services/workoutService.js';
import * as notificationService from '../services/notificationService.js';
import { success } from '../utils/response.js';
const getParam = (value) => {
    const id = Array.isArray(value) ? value[0] : value;
    return id ?? '';
};
export async function createWorkoutHandler(req, res) {
    const workout = await workoutService.createWorkout(req.userId ?? '', req.body);
    success(res, workout, 201);
}
export async function completeWorkoutHandler(req, res) {
    const workout = await workoutService.completeWorkout(req.userId ?? '', getParam(req.params.id));
    try {
        await notificationService.createWorkoutCompletion(req.userId ?? '', workout);
    }
    catch {
        // Notification creation must never fail the completion action.
    }
    success(res, workout);
}
export async function listWorkoutsHandler(req, res) {
    const rawCategory = req.query.category;
    const category = typeof rawCategory === 'string' ? rawCategory : undefined;
    const workouts = await workoutService.listWorkouts(req.userId ?? '', category);
    success(res, workouts);
}
export async function getWorkoutHandler(req, res) {
    const workout = await workoutService.getWorkout(req.userId ?? '', getParam(req.params.id));
    success(res, workout);
}
export async function updateWorkoutHandler(req, res) {
    const workout = await workoutService.updateWorkout(req.userId ?? '', getParam(req.params.id), req.body);
    success(res, workout);
}
export async function deleteWorkoutHandler(req, res) {
    await workoutService.deleteWorkout(req.userId ?? '', getParam(req.params.id));
    res.status(204).send();
}
