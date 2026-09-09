export const QUICK_LOG_ITEMS = [
    { key: 'water', label: 'Water' },
    { key: 'steps', label: 'Steps' },
    { key: 'calories', label: 'Calories' },
    { key: 'sleep', label: 'Sleep' },
    { key: 'weight', label: 'Weight' },
    { key: 'workout', label: 'Workout' },
];

export const SIDEBAR_MENU = [
    { key: 'dashboard', label: 'Dashboard', path: '/' },
    { key: 'exercise', label: 'Workouts', path: '/workouts' },
    { key: 'nutrition', label: 'Nutrition', path: '/nutrition' },
    { key: 'progress', label: 'Progress', path: '/progress' },
    { key: 'goals', label: 'Goals', path: '/goals' },
    { key: 'history', label: 'History', path: '/workouts-history' },
    { key: 'analytics', label: 'Analytics', path: '/analytics' },
    { key: 'notifications', label: 'Notifications', path: '/notifications' },
    { key: 'profile', label: 'Profile', path: '/profile' },
    { key: 'settings', label: 'Settings', path: '/settings' },
];

export const UNIT_OPTIONS = [
    { value: 'kg', label: 'kg' },
    { value: 'lb', label: 'lb' },
];

export const THEME_OPTIONS = [
    { value: 'dark', label: 'Dark' },
    { value: 'light', label: 'Light' },
];

export const NOTIFICATION_TYPES = [
    { key: 'workout-completion', label: 'Workout completion', icon: 'BellRing' },
    { key: 'goal-progress', label: 'Goal progress', icon: 'TrendingUp' },
    { key: 'goal-completed', label: 'Goal completed', icon: 'Target' },
    { key: 'workout-reminder', label: 'Workout reminder', icon: 'Bell' },
    { key: 'meal-reminder', label: 'Meal reminder', icon: 'Salad' },
    { key: 'goal-reminder', label: 'Goal reminder', icon: 'Clock' },
];

export const NOTIFICATION_TYPE_KEYS = NOTIFICATION_TYPES.map((type) => type.key);

export const NAV_TABS = [
    { key: 'dashboard', label: 'Dashboard', path: '/' },
    { key: 'workouts', label: 'Workouts', path: '/workouts' },
    { key: 'nutrition', label: 'Nutrition', path: '/nutrition' },
    { key: 'progress', label: 'Progress', path: '/progress' },
    { key: 'goals', label: 'Goals', path: '/goals' },
    { key: 'history', label: 'History', path: '/workouts-history' },
    { key: 'analytics', label: 'Analytics', path: '/analytics' },
    { key: 'bmi', label: 'BMI', path: '/bmi' },
];

export const MACRO_COLORS = ['#A3E635', '#60A5FA', '#F472B6'];

export const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const MEASUREMENT_FIELDS = [
    { key: 'chestCm', label: 'Chest', unit: 'cm' },
    { key: 'waistCm', label: 'Waist', unit: 'cm' },
    { key: 'armsCm', label: 'Arms', unit: 'cm' },
    { key: 'hipsCm', label: 'Hips', unit: 'cm' },
    { key: 'thighsCm', label: 'Thighs', unit: 'cm' },
];

export const GOAL_CATEGORIES = ['strength', 'weight', 'habit', 'endurance'];

export const STREAK_TYPES = [
    { key: 'workout', label: 'Workout Streak', unit: 'days' },
    { key: 'checkin', label: 'Check-in Streak', unit: 'days' },
    { key: 'hydration', label: 'Hydration Streak', unit: 'days' },
];

export const WORKOUT_CATEGORIES = [
    { key: 'strength', label: 'Strength' },
    { key: 'cardio', label: 'Cardio' },
    { key: 'flexibility', label: 'Flexibility' },
    { key: 'hybrid', label: 'Hybrid' },
    { key: 'other', label: 'Other' },
];

export const PR_FIELDS = [
    { key: 'bestLiftKg', label: 'Best Lift', unit: 'kg' },
    { key: 'bestSet', label: 'Best Set', unit: 'kg' },
    { key: 'bestVolumeKg', label: 'Best Volume', unit: 'kg' },
];

export const DATE_FILTER_OPTIONS = [
    { key: 'all', label: 'All' },
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
    { key: 'last3', label: 'Last 3 Months' },
    { key: 'last6', label: 'Last 6 Months' },
    { key: 'lastYear', label: 'This Year' },
    { key: 'custom', label: 'Custom Range' },
];

export const ANALYTICS_PERIODS = [
    { key: 'last30', label: 'Last 30 Days' },
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
    { key: 'last3', label: 'Last 3 Months' },
    { key: 'last6', label: 'Last 6 Months' },
    { key: 'lastYear', label: 'Last Year' },
    { key: 'custom', label: 'Custom Range' },
];

export const CHART_COLORS = {
    accent: 'var(--color-accent)',
    secondary: '#60A5FA',
    muted: 'var(--color-ink-muted)',
    surplus: '#F87171',
};

export const MACRO_TYPES = [
    { key: 'protein', label: 'Protein', color: '#A3E635' },
    { key: 'carbs', label: 'Carbs', color: '#60A5FA' },
    { key: 'fat', label: 'Fat', color: '#F472B6' },
];

export const COMPARISON_PERIODS = [
    { key: 'week', label: 'This Week vs Last Week' },
    { key: 'month', label: 'This Month vs Last Month' },
];
