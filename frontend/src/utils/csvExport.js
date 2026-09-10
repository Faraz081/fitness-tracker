const BOM = '\uFEFF';

function escapeCell(value) {
    const s = String(value ?? '');
    if (/[",\n\r]/.test(s)) {
        return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
}

function toRow(cells) {
    return cells.map(escapeCell).join(',') + '\n';
}

function downloadCsv(content, filename) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function filename(reportType, from, to) {
    return `${reportType}-${from}_${to}.csv`;
}

function rangeLine(from, to) {
    return `Report range: ${from} to ${to}`;
}

function noRecordsLine(from, to) {
    return `No records for ${from} to ${to}`;
}

function buildOverviewCsv(data, from, to) {
    let out = BOM;
    out += toRow(['Fitness Report Overview']);
    out += toRow([rangeLine(from, to)]) + '\n';

    const w = data.workouts || {};
    const n = data.nutrition || {};
    const p = data.progress || {};

    out += toRow(['Workouts Summary']);
    out += toRow(['Total Workouts', w.totalWorkouts ?? 0]);
    out += toRow(['Total Volume', w.totalVolume ?? 0]) + '\n';

    out += toRow(['Nutrition Summary']);
    out += toRow(['Calories Consumed (total)', Math.round(n.totalCalories ?? 0)]);
    out += toRow(['Avg Daily Calories (logged days)', n.avgDailyCalories ?? 0]);
    out += toRow(['Days Logged', n.daysLogged ?? 0]) + '\n';

    out += toRow(['Progress Summary']);
    out += toRow(['Weight (kg)', p.latestWeight ?? 'No data']);
    out += toRow(['Weight Change (kg)', p.weightChange ?? 'No data']);
    out += toRow(['Goal', p.goal ?? 'No data']);
    out += toRow(['Consistency Score', p.consistencyScore != null ? `${p.consistencyScore}%` : 'No data']);

    if ((w.totalWorkouts ?? 0) === 0 && (n.daysLogged ?? 0) === 0) {
        out += '\n' + toRow([noRecordsLine(from, to)]);
    }
    return out;
}

function buildWorkoutCsv(data, from, to) {
    let out = BOM;
    out += toRow(['Workout Report']);
    out += toRow([rangeLine(from, to)]) + '\n';

    const s = data.summary || {};
    out += toRow(['Summary']);
    out += toRow(['Total Workouts', s.totalWorkouts ?? 0]);
    out += toRow(['Total Volume', s.totalVolume ?? 0]);
    out += toRow(['Avg Sessions/Week', s.avgSessionsPerWeek ?? 0]);
    out += toRow(['PR Count', data.prCount ?? 0]) + '\n';

    const workouts = data.workouts || [];
    if (workouts.length > 0) {
        out += toRow(['date,title,category,volume_kg,exercise_count,pr_count'.split(',')]);
        workouts.forEach((w) => {
            out += toRow([w.date, w.name, w.category, w.volume, w.exerciseCount, w.prCount]);
        });
    }
    if (workouts.length === 0) {
        out += toRow([noRecordsLine(from, to)]);
    }
    return out;
}

function buildNutritionCsv(data, from, to) {
    let out = BOM;
    out += toRow(['Nutrition Report']);
    out += toRow([rangeLine(from, to)]) + '\n';

    const s = data.summary || {};
    out += toRow(['Summary']);
    out += toRow(['Total Calories', Math.round(s.totalCalories ?? 0)]);
    out += toRow(['Avg Daily Calories', s.avgDailyCalories ?? 0]);
    out += toRow(['Days Logged', s.daysLogged ?? 0]);
    out += toRow(['Total Protein (g)', Math.round(s.totalProtein ?? 0)]);
    out += toRow(['Total Carbs (g)', Math.round(s.totalCarbs ?? 0)]);
    out += toRow(['Total Fat (g)', Math.round(s.totalFat ?? 0)]) + '\n';

    const daily = data.dailyTotals || [];
    if (daily.length > 0) {
        out += toRow(['date,calories,protein_g,carbs_g,fat_g'.split(',')]);
        daily.forEach((d) => {
            out += toRow([d.date, Math.round(d.calories), Math.round(d.protein), Math.round(d.carbs), Math.round(d.fat)]);
        });
        out += '\n';
    }

    const meals = data.meals || [];
    if (meals.length > 0) {
        out += toRow(['date,meal_type,food_name,quantity,unit,calories,protein_g,carbs_g,fat_g'.split(',')]);
        meals.forEach((m) => {
            out += toRow([m.date, m.mealType, m.foodName, m.quantity, m.unit ?? '', Math.round(m.calories), Math.round(m.protein), Math.round(m.carbs), Math.round(m.fat)]);
        });
    }
    if (daily.length === 0 && meals.length === 0) {
        out += toRow([noRecordsLine(from, to)]);
    }
    return out;
}

function buildProgressCsv(data, from, to) {
    let out = BOM;
    out += toRow(['Progress Report']);
    out += toRow([rangeLine(from, to)]) + '\n';

    const p = data.profile || {};
    const c = data.consistency || {};
    out += toRow(['Summary']);
    out += toRow(['Latest Weight (kg)', p.latestWeight ?? 'No data']);
    out += toRow(['Goal', p.goal ?? 'No data']);
    out += toRow(['Workout Consistency (sessions/week)', c.workoutConsistency ?? 0]);
    out += toRow(['Nutrition Consistency (%)', c.nutritionConsistency ?? 0]);
    out += toRow(['Strength PR Count', data.prCount ?? 0]) + '\n';

    const prog = data.strengthProgression || [];
    if (prog.length > 0) {
        out += toRow(['exercise,best_weight_kg,prior_best_kg,delta_kg'.split(',')]);
        prog.forEach((s) => {
            out += toRow([s.exercise, s.bestWeight, s.priorBest > 0 ? s.priorBest : 'No prior', s.delta]);
        });
    }
    if (prog.length === 0 && p.latestWeight == null && p.goal == null && (c.nutritionDaysLogged ?? 0) === 0) {
        out += toRow([noRecordsLine(from, to)]);
    }
    return out;
}

export function exportOverviewCsv(data, dateRange, _userName) {
    downloadCsv(buildOverviewCsv(data, dateRange.from, dateRange.to), filename('overview', dateRange.from, dateRange.to));
}

export function exportWorkoutCsv(data, dateRange, _userName) {
    downloadCsv(buildWorkoutCsv(data, dateRange.from, dateRange.to), filename('workout', dateRange.from, dateRange.to));
}

export function exportNutritionCsv(data, dateRange, _userName) {
    downloadCsv(buildNutritionCsv(data, dateRange.from, dateRange.to), filename('nutrition', dateRange.from, dateRange.to));
}

export function exportProgressCsv(data, dateRange, _userName) {
    downloadCsv(buildProgressCsv(data, dateRange.from, dateRange.to), filename('progress', dateRange.from, dateRange.to));
}