import * as goalService from '../services/goalService.js';
import { success } from '../utils/response.js';

const ownerOf = (req) => req.userId ?? '';

export async function getGoalsHandler(req, res, next) {
    try {
        const data = await goalService.getGoals(ownerOf(req), req.query.today);
        success(res, data);
    }
    catch (err) {
        next(err);
    }
}

export async function createGoalHandler(req, res, next) {
    try {
        const goal = await goalService.createGoal(ownerOf(req), req.body);
        success(res, {
            id: goal._id.toString(),
            title: goal.title,
            category: goal.category,
            targetValue: goal.targetValue,
            unit: goal.unit,
            startDate: goal.startDate ?? null,
            targetDate: goal.targetDate ?? null,
            currentValue: null,
            completedAt: null,
            milestones: goal.milestones.map((m) => ({
                id: m.id,
                title: m.title,
                threshold: m.threshold,
                reachedAt: null,
            })),
        }, 201);
    }
    catch (err) {
        next(err);
    }
}

export async function updateGoalHandler(req, res, next) {
    try {
        const goal = await goalService.updateGoal(ownerOf(req), req.params.id, req.body);
        success(res, {
            id: goal._id.toString(),
            title: goal.title,
            category: goal.category,
            targetValue: goal.targetValue,
            unit: goal.unit,
            startDate: goal.startDate ?? null,
            targetDate: goal.targetDate ?? null,
        });
    }
    catch (err) {
        next(err);
    }
}

export async function deleteGoalHandler(req, res, next) {
    try {
        const goal = await goalService.deleteGoal(ownerOf(req), req.params.id);
        success(res, { id: goal._id.toString() });
    }
    catch (err) {
        next(err);
    }
}

export async function addHydrationHandler(req, res, next) {
    try {
        const hydration = await goalService.addHydration(ownerOf(req), req.body);
        success(res, hydration, 201);
    }
    catch (err) {
        next(err);
    }
}

export async function deleteHydrationHandler(req, res, next) {
    try {
        const hydration = await goalService.deleteHydration(ownerOf(req), req.params.id);
        success(res, hydration);
    }
    catch (err) {
        next(err);
    }
}