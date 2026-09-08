export const dashboardData = {
    user: {
        name: 'Alex Morgan',
        email: 'alex.morgan@example.com',
    },
    summary: [
        { key: 'workouts', label: 'Total Workouts', value: 24, unit: '' },
        { key: 'exercises', label: 'Total Exercises', value: 168, unit: '' },
        { key: 'caloriesBurned', label: 'Calories Burned', value: 12450, unit: 'kcal' },
        { key: 'caloriesConsumed', label: 'Calories Consumed', value: 9200, unit: 'kcal' },
        { key: 'weight', label: 'Current Weight', value: 78.5, unit: 'kg' },
        { key: 'streak', label: 'Workout Streak', value: 12, unit: 'days' },
    ],
    dailyGoals: [
        { key: 'hydration', label: 'Hydration', current: 1.8, target: 2.5, unit: 'L' },
        { key: 'calories', label: 'Calories', current: 1850, target: 2400, unit: 'kcal' },
        { key: 'steps', label: 'Steps', current: 7400, target: 10000, unit: 'steps' },
        { key: 'sleep', label: 'Sleep', current: 6.5, target: 8, unit: 'hrs' },
    ],
    rings: [
        { key: 'activity', label: 'Active Min', value: 72, max: 90, unit: 'min' },
        { key: 'workouts', label: 'Workouts', value: 4, max: 5, unit: '' },
        { key: 'steps', label: 'Step Goal', value: 74, max: 100, unit: '%' },
    ],
    weeklyWorkouts: [
        { day: 'Mon', value: 3 },
        { day: 'Tue', value: 2 },
        { day: 'Wed', value: 4 },
        { day: 'Thu', value: 1 },
        { day: 'Fri', value: 5 },
        { day: 'Sat', value: 3 },
        { day: 'Sun', value: 2 },
    ],
    caloriesSeries: [
        { label: 'Mon', value: 2100 },
        { label: 'Tue', value: 1750 },
        { label: 'Wed', value: 2350 },
        { label: 'Thu', value: 1900 },
        { label: 'Fri', value: 2600 },
        { label: 'Sat', value: 2200 },
        { label: 'Sun', value: 2050 },
    ],
    macros: { protein: 120, carbs: 220, fat: 65 },
    recentWorkouts: [
        { id: 1, name: 'Push Day', category: 'Strength', date: '2026-09-06', metric: '4 exercises' },
        { id: 2, name: 'Morning Run', category: 'Cardio', date: '2026-09-05', metric: '5 km' },
        { id: 3, name: 'Full Body', category: 'Hybrid', date: '2026-09-03', metric: '6 exercises' },
        { id: 4, name: 'Stretch & Mobility', category: 'Flexibility', date: '2026-09-01', metric: '20 min' },
    ],
};

export const emptyDashboardData = {
    user: { name: 'Alex Morgan', email: 'alex.morgan@example.com' },
    summary: [],
    dailyGoals: [],
    rings: [],
    weeklyWorkouts: [],
    caloriesSeries: [],
    macros: null,
    recentWorkouts: [],
};
