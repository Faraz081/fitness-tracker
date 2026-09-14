import { Types } from 'mongoose';
import { Nutrition } from '../models/Nutrition.js';
import { AppError } from '../utils/apiError.js';
const toNutrition = (n) => ({
    id: String(n._id),
    foodName: n.foodName,
    quantity: n.quantity,
    unit: n.unit ?? null,
    calories: n.calories,
    protein: n.protein,
    carbs: n.carbs,
    fat: n.fat,
    mealType: n.mealType,
    source: n.source ?? 'manual',
    date: new Date(n.date).toISOString(),
    createdAt: n.createdAt.toISOString(),
    updatedAt: n.updatedAt.toISOString(),
});
const notFound = () => {
    throw new AppError(404, 'Nutrition entry not found', 'NOT_FOUND');
};
const toDayRange = (dateString) => {
    const start = new Date(`${dateString}T00:00:00.000Z`);
    const end = new Date(start.getTime() + 86_400_000);
    return { start, end };
};
export async function createNutritionEntry(owner, input) {
    const doc = await Nutrition.create({
        owner: new Types.ObjectId(owner),
        foodName: input.foodName,
        quantity: input.quantity ?? 1,
        unit: input.unit,
        calories: input.calories,
        protein: input.protein ?? 0,
        carbs: input.carbs ?? 0,
        fat: input.fat ?? 0,
        mealType: input.mealType,
        source: input.source === 'ai' ? 'ai' : 'manual',
        date: input.date ?? new Date(),
    });
    const created = doc;
    return toNutrition(created);
}
export async function listNutritionEntries(owner, query) {
    const filter = { owner };
    if (query.mealType) {
        filter.mealType = query.mealType;
    }
    if (query.date) {
        const { start, end } = toDayRange(query.date);
        filter.date = { $gte: start, $lt: end };
    }
    const docs = await Nutrition.find(filter)
        .sort({ date: -1, createdAt: -1 })
        .lean();
    return docs.map(toNutrition);
}
export async function getNutritionSummary(owner, dateString) {
    const date = dateString ?? new Date().toISOString().slice(0, 10);
    const { start, end } = toDayRange(date);
    const result = (await Nutrition.aggregate([
        { $match: { owner: new Types.ObjectId(owner), date: { $gte: start, $lt: end } } },
        {
            $group: {
                _id: null,
                calories: { $sum: '$calories' },
                protein: { $sum: '$protein' },
                carbs: { $sum: '$carbs' },
                fat: { $sum: '$fat' },
            },
        },
    ]));
    const row = result[0];
    return {
        date,
        calories: row?.calories ?? 0,
        protein: row?.protein ?? 0,
        carbs: row?.carbs ?? 0,
        fat: row?.fat ?? 0,
    };
}
export async function getNutritionEntry(owner, id) {
    const doc = await Nutrition.findOne({ owner, _id: id }).lean();
    if (!doc) {
        notFound();
    }
    return toNutrition(doc);
}
export async function updateNutritionEntry(owner, id, patch) {
    const doc = await Nutrition.findOneAndUpdate({ owner, _id: id }, { $set: patch }, { new: true, runValidators: true }).lean();
    if (!doc) {
        notFound();
    }
    return toNutrition(doc);
}
export async function deleteNutritionEntry(owner, id) {
    const result = await Nutrition.deleteOne({ owner, _id: id });
    if (result.deletedCount === 0) {
        notFound();
    }
}
