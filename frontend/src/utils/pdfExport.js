import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
    workoutVolumeSeries,
    workoutFrequencySeries,
    caloriesDailySeries,
    macroSlices,
    shortDate,
} from './reportCharts.js';

function round1(n) {
    return n != null ? +n.toFixed(1) : null;
}

const ACCENT = [163, 230, 53];
const INK = [244, 246, 248];
const MUTED = [107, 114, 128];
const SUCCESS = [34, 197, 94];
const WARNING = [245, 158, 11];

function filename(reportType, from, to) {
    return `${reportType}-${from}_${to}.pdf`;
}

const TITLES = {
    overview: 'Fitness Report Overview',
    workout: 'Workout Report',
    nutrition: 'Nutrition Report',
    progress: 'Progress Report',
};

function addHeader(doc, title, userName, dateRange) {
    const now = new Date();
    doc.setFontSize(18);
    doc.text('Fitness Tracker', 14, 20);
    doc.setFontSize(12);
    doc.text(title, 14, 28);
    doc.setFontSize(10);
    doc.text(`User: ${userName}`, 14, 35);
    doc.text(`Range: ${dateRange.from} to ${dateRange.to}`, 14, 40);
    doc.text(`Generated: ${now.toLocaleString()}`, 14, 45);
    doc.line(14, 49, 196, 49);
}

function addKpiCard(doc, x, y, label, value) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(String(label), x, y);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(String(value), x, y + 6);
    doc.setFont('helvetica', 'normal');
}

function sectionTitle(doc, text, y) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(text, 14, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    return y + 6;
}

function drawBarChart(doc, items, x, y, w, h, color = ACCENT) {
    if (!items.length) return;
    const max = Math.max(1, ...items.map((i) => i.value));
    const slot = w / items.length;
    const barW = Math.min(slot * 0.6, 12);
    doc.setFillColor(color[0], color[1], color[2]);
    items.forEach((it, i) => {
        const bh = (it.value / max) * (h - 10);
        doc.roundedRect(x + slot * i + (slot - barW) / 2, y + h - bh, barW, bh, 1, 1, 'F');
    });
    doc.setFontSize(7);
    doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
    doc.text(String(items[0].label), x + 1, y + h + 4);
    doc.text(String(items[items.length - 1].label), x + w - 1, y + h + 4, { align: 'right' });
    doc.setTextColor(INK[0], INK[1], INK[2]);
}

function drawLineChart(doc, items, x, y, w, h, color = ACCENT) {
    if (!items.length) return;
    const values = items.map((i) => i.value);
    const max = Math.max(...values, 1);
    const min = Math.min(...values, 0);
    const span = max - min || 1;
    const px = (i) => x + (items.length > 1 ? (i / (items.length - 1)) * w : w / 2);
    const py = (v) => y + h - ((v - min) / span) * (h - 6);
    doc.setDrawColor(color[0], color[1], color[2]);
    doc.setLineWidth(1);
    items.forEach((it, i) => {
        if (i > 0) doc.line(px(i - 1), py(items[i - 1].value), px(i), py(it.value));
        doc.setFillColor(color[0], color[1], color[2]);
        doc.circle(px(i), py(it.value), 1.3, 'F');
    });
    doc.setFontSize(7);
    doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
    doc.text(String(items[0].label), x, y + h + 4);
    doc.text(String(items[items.length - 1].label), x + w, y + h + 4, { align: 'right' });
    doc.setTextColor(INK[0], INK[1], INK[2]);
}

function drawMacroStack(doc, slices, x, y, w) {
    const total = slices.reduce((s, k) => s + k.value, 0) || 1;
    const colors = [SUCCESS, ACCENT, WARNING];
    let cx = x;
    doc.setFontSize(7);
    slices.forEach((s, i) => {
        const sw = Math.max(3, (s.value / total) * w);
        doc.setFillColor(colors[i % colors.length][0], colors[i % colors.length][1], colors[i % colors.length][2]);
        doc.rect(cx, y, sw, 8, 'F');
        doc.setTextColor(INK[0], INK[1], INK[2]);
        doc.text(`${s.label} ${Math.round(s.value)}g`, cx + 1, y - 2);
        cx += sw;
    });
    doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
    doc.text(`${Math.round(total)}g total`, x, y + 14);
    doc.setTextColor(INK[0], INK[1], INK[2]);
}

function drawProgressionBars(doc, progression, x, y, w, h) {
    const list = progression.slice(0, 10);
    if (!list.length) return;
    const max = Math.max(1, ...list.flatMap((s) => [s.priorBest, s.bestWeight]));
    const slot = w / list.length;
    const barW = Math.min(slot * 0.3, 9);
    doc.setFontSize(6.5);
    list.forEach((s, i) => {
        const cx = x + slot * i + slot / 2;
        const pb = (s.priorBest / max) * (h - 10);
        const bw = (s.bestWeight / max) * (h - 10);
        doc.setFillColor(MUTED[0], MUTED[1], MUTED[2]);
        doc.rect(cx - barW, y + h - pb, barW, pb, 'F');
        doc.setFillColor(ACCENT[0], ACCENT[1], ACCENT[2]);
        doc.rect(cx + 0.5, y + h - bw, barW, bw, 'F');
        doc.setTextColor(INK[0], INK[1], INK[2]);
        doc.text(String(s.exercise), cx, y + h + 4, { align: 'center' });
    });
    doc.setFontSize(7);
    doc.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
    doc.text('Grey: prior best · Lime: best in range', x, y + h + 12);
    doc.setTextColor(INK[0], INK[1], INK[2]);
}

function toSeries(items) {
    return items.map((d) => ({ label: shortDate(d.date), value: d.value }));
}

export function exportOverviewPdf(data, dateRange, userName) {
    const doc = new jsPDF();
    addHeader(doc, TITLES.overview, userName, dateRange);

    const w = data.workouts || {};
    const n = data.nutrition || {};
    const p = data.progress || {};

    const columns = ['Metric', 'Value'];
    const rows = [
        ['Total Workouts', w.totalWorkouts ?? 'No data'],
        ['Total Volume (kg)', w.totalVolume != null ? round1(w.totalVolume) : 'No data'],
        ['Calories Consumed', n.totalCalories != null ? Math.round(n.totalCalories) : 'No data'],
        ['Avg Daily Calories', n.avgDailyCalories != null ? round1(n.avgDailyCalories) : 'No data'],
        ['Days Logged', n.daysLogged ?? 'No data'],
        ['Latest Weight (kg)', p.latestWeight != null ? round1(p.latestWeight) : 'No data'],
        ['Weight Change', p.weightChange ?? 'No data'],
        ['Goal', p.goal ?? 'No data'],
        ['Consistency Score', p.consistencyScore != null ? `${p.consistencyScore}%` : 'No data'],
    ];

    let y;
    autoTable(doc, { startY: 58, head: [columns], body: rows, theme: 'grid' });
    y = (doc.lastAutoTable?.finalY ?? 58) + 8;
    addKpiCard(doc, 14, y, 'Total Workouts', data.workouts?.totalWorkouts ?? 'No data');
    addKpiCard(doc, 92, y, 'Total Volume (kg)', data.workouts?.totalVolume != null ? round1(data.workouts.totalVolume) : 'No data');
    addKpiCard(doc, 170, y, 'Consistency', data.progress?.consistencyScore != null ? `${data.progress.consistencyScore}%` : 'No data');

    doc.save(filename('overview', dateRange.from, dateRange.to));
}

export function exportWorkoutPdf(data, dateRange, userName) {
    const doc = new jsPDF();
    addHeader(doc, TITLES.workout, userName, dateRange);

    const s = data.summary || {};
    const workouts = data.workouts || [];
    const notable = data.notableLifts || [];

    autoTable(doc, {
        startY: 58,
        head: [['Metric', 'Value']],
        body: [
            ['Total Workouts', s.totalWorkouts ?? 'No data'],
            ['Total Volume (kg)', s.totalVolume != null ? round1(s.totalVolume) : 'No data'],
            ['Avg Sessions/Week', s.avgSessionsPerWeek ?? 'No data'],
            ['PR Count', data.prCount ?? 'No data'],
        ],
        theme: 'grid',
    });

    let y = (doc.lastAutoTable?.finalY ?? 58) + 8;
    y = sectionTitle(doc, 'Volume Over Time (kg)', y);
    drawBarChart(doc, toSeries(workoutVolumeSeries(workouts)), 14, y, 90, 34);
    y += 44;
    y = sectionTitle(doc, 'Workout Frequency', y);
    drawBarChart(doc, toSeries(workoutFrequencySeries(s.frequencySeries)), 14, y, 90, 34);
    y += 36;

    if (workouts.length > 0) {
        autoTable(doc, {
            startY: y,
            head: [['Date', 'Title', 'Category', 'Volume', 'Exercises', 'PRs']],
            body: workouts.map((ww) => [ww.date, ww.name, ww.category, round1(ww.volume), ww.exerciseCount, ww.prCount]),
            theme: 'grid',
        });
        y = (doc.lastAutoTable?.finalY ?? y) + 8;
    } else {
        doc.setFontSize(10);
        doc.text('No workouts in this range.', 14, y);
        y += 8;
    }

    if (notable.length > 0) {
        autoTable(doc, {
            startY: y,
            head: [['Notable Lifts', 'Best Weight (kg)']],
            body: notable.map((l) => [l.exercise, l.weight]),
            theme: 'grid',
        });
        y = (doc.lastAutoTable?.finalY ?? y) + 8;
    }

    doc.setFontSize(10);
    doc.text('Duration and muscle groups are not tracked by this app.', 14, y);
    doc.save(filename('workout', dateRange.from, dateRange.to));
}

export function exportNutritionPdf(data, dateRange, userName) {
    const doc = new jsPDF();
    addHeader(doc, TITLES.nutrition, userName, dateRange);

    const s = data.summary || {};
    const daily = data.dailyTotals || [];
    const meals = data.meals || [];

    autoTable(doc, {
        startY: 58,
        head: [['Metric', 'Value']],
        body: [
            ['Total Calories', Math.round(s.totalCalories ?? 0)],
            ['Avg Daily Calories', s.avgDailyCalories ?? 0],
            ['Days Logged', s.daysLogged ?? 0],
            ['Total Protein (g)', Math.round(s.totalProtein ?? 0)],
            ['Total Carbs (g)', Math.round(s.totalCarbs ?? 0)],
            ['Total Fat (g)', Math.round(s.totalFat ?? 0)],
        ],
        theme: 'grid',
    });

    let y = (doc.lastAutoTable?.finalY ?? 58) + 8;
    y = sectionTitle(doc, 'Calories Per Day', y);
    drawLineChart(doc, toSeries(caloriesDailySeries(daily)), 14, y, 90, 34);
    y += 44;
    const macros = macroSlices(s);
    if (macros.length > 0) {
        y = sectionTitle(doc, 'Macro Distribution', y);
        drawMacroStack(doc, macros, 14, y, 90);
        y += 24;
    }

    if (daily.length > 0) {
        autoTable(doc, {
            startY: y,
            head: [['Date', 'Calories', 'Protein', 'Carbs', 'Fat']],
            body: daily.map((d) => [d.date, Math.round(d.calories), Math.round(d.protein), Math.round(d.carbs), Math.round(d.fat)]),
            theme: 'grid',
        });
        y = (doc.lastAutoTable?.finalY ?? y) + 8;
    }

    if (meals.length > 0) {
        autoTable(doc, {
            startY: y,
            head: [['Date', 'Meal', 'Food', 'Calories', 'P', 'C', 'F']],
            body: meals.map((m) => [m.date, m.mealType, m.foodName, Math.round(m.calories), Math.round(m.protein), Math.round(m.carbs), Math.round(m.fat)]),
            theme: 'grid',
        });
        y = (doc.lastAutoTable?.finalY ?? y) + 8;
    }

    doc.setFontSize(10);
    doc.text('No goal set in this range.', 14, y);
    doc.save(filename('nutrition', dateRange.from, dateRange.to));
}

export function exportProgressPdf(data, dateRange, userName) {
    const doc = new jsPDF();
    addHeader(doc, TITLES.progress, userName, dateRange);

    const p = data.profile || {};
    const c = data.consistency || {};
    const prog = data.strengthProgression || [];

    autoTable(doc, {
        startY: 58,
        head: [['Metric', 'Value']],
        body: [
            ['Latest Weight (kg)', p.latestWeight != null ? round1(p.latestWeight) : 'No data'],
            ['Goal', p.goal ?? 'No data'],
            ['Workout Consistency', c.workoutConsistency != null ? `${c.workoutConsistency} sessions/week` : 'No data'],
            ['Nutrition Consistency', c.nutritionDaysLogged > 0 ? `${c.nutritionConsistency}%` : 'No data'],
            ['PR Count', data.prCount ?? 0],
        ],
        theme: 'grid',
    });

    let y = (doc.lastAutoTable?.finalY ?? 58) + 8;

    if (prog.length > 0) {
        y = sectionTitle(doc, 'Strength Progression (kg)', y);
        drawProgressionBars(doc, prog, 14, y, 150, 40);
        y += 60;
        autoTable(doc, {
            startY: y,
            head: [['Exercise', 'Best', 'Prior', 'Delta']],
            body: prog.map((s) => [s.exercise, s.bestWeight, s.priorBest > 0 ? s.priorBest : 'No prior', s.delta]),
            theme: 'grid',
        });
        y = (doc.lastAutoTable?.finalY ?? y) + 8;
    }

    doc.setFontSize(10);
    doc.text('Weight history: Not tracked', 14, y);
    doc.text('Milestones: Not tracked', 14, y + 5);
    doc.text('Progress photos: Not tracked', 14, y + 10);
    doc.save(filename('progress', dateRange.from, dateRange.to));
}