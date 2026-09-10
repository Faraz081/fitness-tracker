import { Nutrition } from '../../models/Nutrition.js';

function toDateStr(d) {
    return new Date(d).toISOString().split('T')[0];
}

export async function getNutritionReport(owner, fromDate, toDate) {
    const entries = await Nutrition.find({
        owner,
        date: { $gte: fromDate, $lte: toDate },
    }).sort({ date: 1 }).lean();

    const rangeDays = Math.ceil((toDate - fromDate) / (1000 * 60 * 60 * 24)) + 1;

    const totalCalories = entries.reduce((s, e) => s + e.calories, 0);
    const totalProtein = entries.reduce((s, e) => s + (e.protein || 0), 0);
    const totalCarbs = entries.reduce((s, e) => s + (e.carbs || 0), 0);
    const totalFat = entries.reduce((s, e) => s + (e.fat || 0), 0);

    const daysWithEntries = new Set(entries.map((e) => toDateStr(e.date)));
    const daysLogged = daysWithEntries.size || 1;

    const mealTypeMap = {};
    entries.forEach((e) => {
        if (!mealTypeMap[e.mealType]) {
            mealTypeMap[e.mealType] = { mealType: e.mealType, entries: 0, calories: 0, protein: 0, carbs: 0, fat: 0 };
        }
        const m = mealTypeMap[e.mealType];
        m.entries += 1;
        m.calories += e.calories;
        m.protein += e.protein || 0;
        m.carbs += e.carbs || 0;
        m.fat += e.fat || 0;
    });
    const mealTypeBreakdown = Object.values(mealTypeMap);

    const dailyMap = {};
    entries.forEach((e) => {
        const key = toDateStr(e.date);
        if (!dailyMap[key]) dailyMap[key] = { date: key, calories: 0, protein: 0, carbs: 0, fat: 0 };
        const d = dailyMap[key];
        d.calories += e.calories;
        d.protein += e.protein || 0;
        d.carbs += e.carbs || 0;
        d.fat += e.fat || 0;
    });
    const dailyTotals = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));

    const meals = entries.map((e) => ({
        id: String(e._id),
        date: toDateStr(e.date),
        mealType: e.mealType,
        foodName: e.foodName,
        quantity: e.quantity ?? 1,
        unit: e.unit ?? null,
        calories: e.calories,
        protein: e.protein || 0,
        carbs: e.carbs || 0,
        fat: e.fat || 0,
    }));

    return {
        dateRange: {
            from: toDateStr(fromDate),
            to: toDateStr(toDate),
            days: rangeDays,
        },
        summary: {
            totalCalories,
            avgDailyCalories: entries.length > 0 ? +((totalCalories / daysLogged)).toFixed(1) : 0,
            totalProtein,
            avgDailyProtein: entries.length > 0 ? +((totalProtein / daysLogged)).toFixed(1) : 0,
            totalCarbs,
            avgDailyCarbs: entries.length > 0 ? +((totalCarbs / daysLogged)).toFixed(1) : 0,
            totalFat,
            avgDailyFat: entries.length > 0 ? +((totalFat / daysLogged)).toFixed(1) : 0,
            daysLogged: entries.length > 0 ? daysLogged : 0,
        },
        mealTypeBreakdown,
        dailyTotals,
        meals,
        goalComparison: null,
    };
}
