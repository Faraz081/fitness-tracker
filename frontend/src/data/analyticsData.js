const workouts = [
    {
        id: 'w1',
        name: 'Push Day',
        category: 'strength',
        date: '2026-06-15',
        notes: 'Felt strong on bench, added a rep.',
        exercises: [
            { id: 'e1', name: 'Bench Press', sets: 4, reps: 8, weightKg: 60 },
            { id: 'e2', name: 'Overhead Press', sets: 3, reps: 8, weightKg: 40 },
        ],
    },
    {
        id: 'w2',
        name: 'Morning Run',
        category: 'cardio',
        date: '2026-06-20',
        notes: '',
        exercises: [
            { id: 'e3', name: 'Interval Run', sets: 6, reps: 1 },
        ],
    },
    {
        id: 'w3',
        name: 'Sauna Session',
        category: 'other',
        date: '2026-06-27',
        notes: 'Recovery day.',
        exercises: [],
    },
    {
        id: 'w4',
        name: 'Push Day',
        category: 'strength',
        date: '2026-07-22',
        notes: '',
        exercises: [
            { id: 'e4', name: 'Bench Press', sets: 4, reps: 8, weightKg: 65 },
            { id: 'e5', name: 'Overhead Press', sets: 3, reps: 8, weightKg: 42.5 },
        ],
    },
    {
        id: 'w5',
        name: 'Yoga Flow',
        category: 'flexibility',
        date: '2026-08-05',
        notes: 'Focus on hips and shoulders.',
        exercises: [
            { id: 'e6', name: 'Sun Salutation', sets: 3, reps: 10 },
            { id: 'e7', name: 'Warrior II Hold', sets: 2, reps: 1 },
        ],
    },
    {
        id: 'w6',
        name: 'Push Day + Core',
        category: 'strength',
        date: '2026-08-19',
        notes: '',
        exercises: [
            { id: 'e8', name: 'Bench Press', sets: 4, reps: 8, weightKg: 70 },
            { id: 'e9', name: 'Overhead Press', sets: 3, reps: 8, weightKg: 45 },
            { id: 'e10', name: 'Plank', sets: 3, reps: 1 },
        ],
    },
    {
        id: 'w7',
        name: 'Full Body Circuit',
        category: 'hybrid',
        date: '2026-09-02',
        notes: '',
        exercises: [
            { id: 'e11', name: 'Squat', sets: 5, reps: 5, weightKg: 100 },
            { id: 'e12', name: 'Dumbbell Row', sets: 4, reps: 10, weightKg: 24 },
            { id: 'e13', name: 'Plank', sets: 3, reps: 1 },
        ],
    },
    {
        id: 'w8',
        name: 'Evening Run',
        category: 'cardio',
        date: '2026-09-07',
        notes: '',
        exercises: [
            { id: 'e14', name: 'Interval Run', sets: 6, reps: 1 },
        ],
    },
    {
        id: 'w9',
        name: 'Push Day',
        category: 'strength',
        date: '2026-09-08',
        notes: 'New bench press record.',
        exercises: [
            { id: 'e15', name: 'Bench Press', sets: 4, reps: 8, weightKg: 75 },
            { id: 'e16', name: 'Overhead Press', sets: 3, reps: 8, weightKg: 47.5 },
            { id: 'e17', name: 'Plank', sets: 3, reps: 1 },
        ],
    },
];

const olderWorkouts = [
    {
        id: 'a1',
        name: 'Push Strength',
        category: 'strength',
        date: '2025-09-14',
        notes: '',
        exercises: [
            { id: 'ae1', name: 'Bench Press', sets: 4, reps: 8, weightKg: 52.5 },
            { id: 'ae2', name: 'Overhead Press', sets: 3, reps: 8, weightKg: 37.5 },
        ],
    },
    {
        id: 'a2',
        name: 'Morning Run',
        category: 'cardio',
        date: '2025-10-03',
        notes: '',
        exercises: [
            { id: 'ae3', name: 'Interval Run', sets: 5, reps: 1 },
        ],
    },
    {
        id: 'a3',
        name: 'Push Day',
        category: 'strength',
        date: '2025-11-09',
        notes: '',
        exercises: [
            { id: 'ae4', name: 'Bench Press', sets: 4, reps: 8, weightKg: 55 },
            { id: 'ae5', name: 'Plank', sets: 3, reps: 1 },
        ],
    },
    {
        id: 'a4',
        name: 'Full Body',
        category: 'hybrid',
        date: '2025-12-14',
        notes: '',
        exercises: [
            { id: 'ae6', name: 'Squat', sets: 5, reps: 5, weightKg: 90 },
            { id: 'ae7', name: 'Dumbbell Row', sets: 4, reps: 10, weightKg: 20 },
        ],
    },
    {
        id: 'a5',
        name: 'Push Day',
        category: 'strength',
        date: '2026-01-11',
        notes: '',
        exercises: [
            { id: 'ae8', name: 'Bench Press', sets: 4, reps: 8, weightKg: 57.5 },
            { id: 'ae9', name: 'Overhead Press', sets: 3, reps: 8, weightKg: 40 },
        ],
    },
    {
        id: 'a6',
        name: 'Evening Run',
        category: 'cardio',
        date: '2026-02-08',
        notes: '',
        exercises: [
            { id: 'ae10', name: 'Interval Run', sets: 6, reps: 1 },
        ],
    },
    {
        id: 'a7',
        name: 'Push Day',
        category: 'strength',
        date: '2026-03-22',
        notes: '',
        exercises: [
            { id: 'ae11', name: 'Bench Press', sets: 4, reps: 8, weightKg: 60 },
        ],
    },
    {
        id: 'a8',
        name: 'Yoga Flow',
        category: 'flexibility',
        date: '2026-04-19',
        notes: '',
        exercises: [
            { id: 'ae12', name: 'Sun Salutation', sets: 3, reps: 10 },
        ],
    },
    {
        id: 'a9',
        name: 'Push Day',
        category: 'strength',
        date: '2026-05-17',
        notes: '',
        exercises: [
            { id: 'ae13', name: 'Bench Press', sets: 4, reps: 8, weightKg: 62.5 },
            { id: 'ae14', name: 'Plank', sets: 3, reps: 1 },
        ],
    },
];

const weightEntries = [
    { id: 'aw1', date: '2025-09-10', weightKg: 87.5 },
    { id: 'aw2', date: '2025-11-12', weightKg: 86 },
    { id: 'aw3', date: '2026-01-14', weightKg: 84.2 },
    { id: 'aw4', date: '2026-02-11', weightKg: 83.6 },
    { id: 'aw5', date: '2026-03-18', weightKg: 82.8 },
    { id: 'aw6', date: '2026-04-15', weightKg: 82 },
    { id: 'aw7', date: '2026-05-13', weightKg: 81.1 },
    { id: 'aw8', date: '2026-06-10', weightKg: 80.6 },
    { id: 'aw9', date: '2026-07-08', weightKg: 79.9 },
    { id: 'aw10', date: '2026-08-11', weightKg: 80.2 },
    { id: 'aw10b', date: '2026-08-11', weightKg: 80 },
    { id: 'aw11', date: '2026-08-25', weightKg: 78.6 },
    { id: 'aw12', date: '2026-09-01', weightKg: 78.1 },
    { id: 'aw13', date: '2026-09-07', weightKg: 77.6 },
    { id: 'aw14', date: '2026-09-09', weightKg: 77.2 },
];

const DAYS = 30;

const DAILY_BURNED = [2300, 2350, 2450, 2250, 2200, 2350, 2250, 2400, 2400, 2320, 2250, 2450, 2200, 2350, 2500, 2150, 2400, 2350, 2300, 2500, 2200, 2300, 2400, 2450, 2280, 2200, 2350, 2450, 2250, 2380];
const DAILY_CONSUMED = [2050, 2200, 2600, 1950, 2000, 2450, 1900, 2100, 2300, 1980, 2150, 2050, 2150, 1920, 2400, 2000, 2100, 2500, 1950, 2200, 1850, 2320, 2050, 2100, 1980, 2350, 2000, 2150, 1900, 2080];
const DAILY_PROTEIN = [165, 155, 140, 160, 158, 145, 170, 155, 150, 168, 162, 172, 148, 142, 155, 160, 152, 148, 168, 156, 145, 150, 162, 158, 150, 146, 165, 152, 148, 160];
const DAILY_CARBS = [205, 200, 260, 190, 215, 245, 180, 210, 225, 195, 218, 205, 220, 195, 250, 195, 215, 255, 190, 225, 180, 235, 205, 215, 198, 240, 205, 220, 190, 212];
const DAILY_FAT = [60, 65, 70, 58, 62, 68, 55, 62, 60, 58, 63, 58, 60, 62, 68, 57, 62, 66, 55, 64, 54, 60, 63, 62, 58, 62, 61, 66, 55, 63];

function isoDayOffset(daysBeforeToday) {
    const d = new Date(Date.UTC(2026, 8, 9));
    d.setUTCDate(d.getUTCDate() - daysBeforeToday);
    return d.toISOString().slice(0, 10);
}

const calorieDays = [];
const macroDays = [];
for (let i = 0; i < DAYS; i++) {
    const date = isoDayOffset(DAYS - 1 - i);
    const consumed = DAILY_CONSUMED[i];
    const burned = DAILY_BURNED[i];
    calorieDays.push({ date, consumed, burned, deficit: burned - consumed });
    const protein = DAILY_PROTEIN[i];
    const carbs = DAILY_CARBS[i];
    const fat = DAILY_FAT[i];
    macroDays.push({
        date,
        protein,
        carbs,
        fat,
        calories: 4 * protein + 4 * carbs + 9 * fat,
    });
}

const weeklyCalorieSamples = [
    { date: '2025-12-10', consumed: 1950, burned: 2250, deficit: 300 },
    { date: '2025-12-24', consumed: 2550, burned: 2350, deficit: -200 },
    { date: '2026-01-14', consumed: 2000, burned: 2350, deficit: 350 },
    { date: '2026-02-11', consumed: 2100, burned: 2450, deficit: 350 },
    { date: '2026-03-11', consumed: 2200, burned: 2400, deficit: 200 },
    { date: '2026-04-15', consumed: 1950, burned: 2250, deficit: 300 },
    { date: '2026-05-13', consumed: 2050, burned: 2300, deficit: 250 },
    { date: '2026-06-10', consumed: 2150, burned: 2400, deficit: 250 },
];

const weeklyMacroSamples = [
    { date: '2025-12-10', protein: 150, carbs: 205, fat: 62, calories: 1948 },
    { date: '2025-12-24', protein: 140, carbs: 270, fat: 74, calories: 2306 },
    { date: '2026-01-14', protein: 162, carbs: 200, fat: 58, calories: 1970 },
    { date: '2026-02-11', protein: 155, carbs: 215, fat: 64, calories: 2052 },
    { date: '2026-03-11', protein: 160, carbs: 225, fat: 62, calories: 2068 },
    { date: '2026-04-15', protein: 158, carbs: 195, fat: 58, calories: 1934 },
    { date: '2026-05-13', protein: 165, carbs: 210, fat: 60, calories: 1980 },
    { date: '2026-06-10', protein: 158, carbs: 218, fat: 63, calories: 2024 },
];

calorieDays.push(...weeklyCalorieSamples);
macroDays.push(...weeklyMacroSamples);

export const analyticsData = {
    workouts: [...workouts, ...olderWorkouts],
    weightEntries,
    calorieDays,
    macroDays,
    goalWeightKg: 75,
    insightPool: {
        consistency: [
            'Great consistency — you are keeping a steady training rhythm.',
            'Your session frequency is in a healthy range for this period.',
        ],
        calories: [
            'You are tracking calories within your target band — keep it up.',
            'Mixed calorie days this period — aiming for a steady deficit helps.',
        ],
        weight: [
            'Your weight is trending toward your goal of 75 kg.',
            'Good weight alignment — your current trajectory supports your goal.',
        ],
    },
};

export const emptyAnalyticsData = {
    workouts: [],
    weightEntries: [],
    calorieDays: [],
    macroDays: [],
    goalWeightKg: null,
    insightPool: {},
};