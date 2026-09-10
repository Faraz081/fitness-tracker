import * as overviewService from '../services/reports/overviewReportService.js';
import * as workoutService from '../services/reports/workoutReportService.js';
import * as nutritionService from '../services/reports/nutritionReportService.js';
import * as progressService from '../services/reports/progressReportService.js';
import { success } from '../utils/response.js';

function parseDate(str) {
    if (!str) return null;
    const d = new Date(str + 'T00:00:00');
    return isNaN(d.getTime()) ? null : d;
}

function defaultRange() {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 30);
    return { from, to };
}

export async function getOverviewHandler(req, res, next) {
    try {
        const q = req.validatedQuery || {};
        const from = parseDate(q.from);
        const to = parseDate(q.to);
        if (!from || !to) {
            const { from: df, to: dt } = defaultRange();
            const data = await overviewService.getOverviewReport(req.userId ?? '', df, dt);
            return success(res, data);
        }
        const data = await overviewService.getOverviewReport(req.userId ?? '', from, to);
        success(res, data);
    } catch (err) {
        next(err);
    }
}

export async function getWorkoutHandler(req, res, next) {
    try {
        const q = req.validatedQuery || {};
        const from = parseDate(q.from);
        const to = parseDate(q.to);
        if (!from || !to) {
            const { from: df, to: dt } = defaultRange();
            const data = await workoutService.getWorkoutReport(req.userId ?? '', df, dt);
            return success(res, data);
        }
        const data = await workoutService.getWorkoutReport(req.userId ?? '', from, to);
        success(res, data);
    } catch (err) {
        next(err);
    }
}

export async function getNutritionHandler(req, res, next) {
    try {
        const q = req.validatedQuery || {};
        const from = parseDate(q.from);
        const to = parseDate(q.to);
        if (!from || !to) {
            const { from: df, to: dt } = defaultRange();
            const data = await nutritionService.getNutritionReport(req.userId ?? '', df, dt);
            return success(res, data);
        }
        const data = await nutritionService.getNutritionReport(req.userId ?? '', from, to);
        success(res, data);
    } catch (err) {
        next(err);
    }
}

export async function getProgressHandler(req, res, next) {
    try {
        const q = req.validatedQuery || {};
        const from = parseDate(q.from);
        const to = parseDate(q.to);
        if (!from || !to) {
            const { from: df, to: dt } = defaultRange();
            const data = await progressService.getProgressReport(req.userId ?? '', df, dt);
            return success(res, data);
        }
        const data = await progressService.getProgressReport(req.userId ?? '', from, to);
        success(res, data);
    } catch (err) {
        next(err);
    }
}
