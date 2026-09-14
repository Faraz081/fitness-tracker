import * as nutritionService from '../services/nutritionService.js';
import * as aiFoodService from '../services/aiFoodService.js';
import { success } from '../utils/response.js';
const getParam = (value) => {
    const id = Array.isArray(value) ? value[0] : value;
    return id ?? '';
};
const getQueryString = (value) => {
    if (typeof value === 'string') {
        return value;
    }
    return undefined;
};
export async function createNutritionHandler(req, res) {
    const entry = await nutritionService.createNutritionEntry(req.userId ?? '', req.body);
    success(res, entry, 201);
}
export async function analyzeNutritionHandler(req, res) {
    const estimate = await aiFoodService.analyzeFood(req.body);
    success(res, estimate);
}
export async function listNutritionHandler(req, res) {
    const query = req.validatedQuery;
    const entries = await nutritionService.listNutritionEntries(req.userId ?? '', {
        mealType: getQueryString(query.mealType),
        date: getQueryString(query.date),
    });
    success(res, entries);
}
export async function summaryDailyHandler(req, res) {
    const query = req.validatedQuery;
    const summary = await nutritionService.getNutritionSummary(req.userId ?? '', getQueryString(query.date));
    success(res, summary);
}
export async function getNutritionHandler(req, res) {
    const entry = await nutritionService.getNutritionEntry(req.userId ?? '', getParam(req.params.id));
    success(res, entry);
}
export async function updateNutritionHandler(req, res) {
    const entry = await nutritionService.updateNutritionEntry(req.userId ?? '', getParam(req.params.id), req.body);
    success(res, entry);
}
export async function deleteNutritionHandler(req, res) {
    await nutritionService.deleteNutritionEntry(req.userId ?? '', getParam(req.params.id));
    res.status(204).send();
}
