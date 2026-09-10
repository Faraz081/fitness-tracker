# Data Model: Reports & Export (8.1)

**Date**: 2026-09-10
**Feature**: 011-reports-export

## Overview

No new Mongoose models are created. Reports aggregate from existing collections:

- `workouts` — Workout records with embedded exercises
- `nutrition` — Nutrition entries with meal types
- `users` — User profile with weight, goal, and preferences

## Existing Collections

### Workouts Collection

```javascript
{
  _id: ObjectId,           // auto-generated
  owner: ObjectId,         // ref User, required, indexed
  title: String,           // required, trim, maxlength 100
  category: String,        // enum: ['strength', 'cardio', 'flexibility', 'hybrid', 'other']
  date: Date,              // required, default Date.now
  notes: String,           // optional, trim, maxlength 2000
  exercises: [{            // embedded subdocuments
    name: String,          // required, trim, maxlength 100
    sets: Number,          // required, min 1, max 50
    reps: Number,          // required, min 1, max 500
    weightKg: Number,      // optional, min 0 (0 = bodyweight)
    notes: String          // optional, trim, maxlength 500
  }],
  createdAt: Date,         // auto
  updatedAt: Date          // auto
}
```

**Indexes**: `{ owner: 1, date: 1 }` (for date-range queries)

**Report Aggregations**:
- Total Workouts: `count({ owner, date: { $gte: from, $lte: to } })`
- Total Volume: `sum(exercises.map(e => e.sets * e.reps * (e.weightKg || 0)))`
- Category Breakdown: `group by category, count`
- Frequency Series: `group by date, count per day`
- Notable Lifts: `group by exercise name, max(weightKg)`
- PRs: Compare range best vs historical best per exercise

### Nutrition Collection

```javascript
{
  _id: ObjectId,           // auto-generated
  owner: ObjectId,         // ref User, required, indexed
  foodName: String,        // required, trim, maxlength 100
  quantity: Number,        // optional, default 1, min 0.01, max 1000
  unit: String,            // optional, trim, maxlength 20
  calories: Number,        // required, min 0, max 2000
  protein: Number,         // optional, default 0, min 0, max 500
  carbs: Number,           // optional, default 0, min 0, max 500
  fat: Number,             // optional, default 0, min 0, max 500
  mealType: String,        // enum: ['breakfast', 'lunch', 'dinner', 'snack']
  date: Date,              // required, default Date.now
  createdAt: Date,         // auto
  updatedAt: Date          // auto
}
```

**Indexes**: `{ owner: 1, date: 1, mealType: 1 }` (composite for efficient queries)

**Report Aggregations**:
- Total Calories: `sum(calories)` for entries in range
- Daily Averages: `total / days with entries`
- Macro Totals: `sum(protein)`, `sum(carbs)`, `sum(fat)`
- Per-Meal-Type Breakdown: `group by mealType, sum calories/macros`
- Days Logged: `count distinct dates with entries`

### User Profile

```javascript
{
  _id: ObjectId,           // auto-generated
  name: String,            // required
  email: String,           // required, unique
  weightKg: Number,        // optional, min 20, max 400
  goal: String,            // optional, enum: ['lose', 'maintain', 'gain', 'other']
  preferences: {
    units: String,         // enum: ['kg', 'lb'], default 'kg'
    theme: String          // enum: ['dark', 'light'], default 'dark'
  }
  // ... other fields
}
```

**Report Usage**:
- Latest Weight: `user.weightKg`
- Goal: `user.goal`
- Units Preference: `user.preferences.units`

## Aggregation Pipelines

### Workout Report Aggregation

```javascript
// Server-side aggregation for workout report
const workoutAggregation = await Workout.aggregate([
  // 1. Match owner and date range
  { $match: { owner: userId, date: { $gte: fromDate, $lte: toDate } } },
  
  // 2. Group by category for breakdown
  { $group: {
    _id: '$category',
    count: { $sum: 1 },
    totalVolume: { $sum: {
      $reduce: {
        input: '$exercises',
        initialValue: 0,
        in: { $add: ['$$value', { $multiply: ['$$this.sets', '$$this.reps', { $ifNull: ['$$this.weightKg', 0] }] }] }
      }
    }}
  }},
  
  // 3. Sort by count descending
  { $sort: { count: -1 } }
]);
```

### Nutrition Report Aggregation

```javascript
// Server-side aggregation for nutrition report
const nutritionAggregation = await Nutrition.aggregate([
  // 1. Match owner and date range
  { $match: { owner: userId, date: { $gte: fromDate, $lte: toDate } } },
  
  // 2. Group by date for daily totals
  { $group: {
    _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
    calories: { $sum: '$calories' },
    protein: { $sum: '$protein' },
    carbs: { $sum: '$carbs' },
    fat: { $sum: '$fat' },
    entries: { $sum: 1 }
  }},
  
  // 3. Sort by date ascending
  { $sort: { _id: 1 } }
]);
```

### Consistency Score Calculation

```javascript
// Server-side calculation
function calculateConsistencyScore(workoutDates, nutritionDates, rangeDays) {
  // Get unique dates with activity
  const activeDates = new Set([
    ...workoutDates.map(d => d.toISOString().split('T')[0]),
    ...nutritionDates.map(d => d.toISOString().split('T')[0])
  ]);
  
  const activeDays = activeDates.size;
  const score = Math.round((activeDays / rangeDays) * 100);
  
  return {
    score,
    activeDays,
    rangeDays,
    hasData: activeDays > 0
  };
}
```

### PR Calculation

```javascript
// Server-side PR calculation
async function calculatePRs(userId, fromDate, toDate) {
  // Get all workouts for this user
  const allWorkouts = await Workout.find({ owner: userId }).sort({ date: 1 });
  
  // Split into range workouts and historical workouts
  const rangeWorkouts = allWorkouts.filter(w => w.date >= fromDate && w.date <= toDate);
  const historicalWorkouts = allWorkouts.filter(w => w.date < fromDate);
  
  // Calculate best weights per exercise in range
  const rangeBest = {};
  rangeWorkouts.forEach(workout => {
    workout.exercises.forEach(exercise => {
      if (exercise.weightKg) {
        const current = rangeBest[exercise.name] || 0;
        rangeBest[exercise.name] = Math.max(current, exercise.weightKg);
      }
    });
  });
  
  // Calculate best weights per exercise in history
  const historicalBest = {};
  historicalWorkouts.forEach(workout => {
    workout.exercises.forEach(exercise => {
      if (exercise.weightKg) {
        const current = historicalBest[exercise.name] || 0;
        historicalBest[exercise.name] = Math.max(current, exercise.weightKg);
      }
    });
  });
  
  // Find PRs (range best > historical best)
  const prs = Object.entries(rangeBest)
    .filter(([exercise, weight]) => weight > (historicalBest[exercise] || 0))
    .map(([exercise, weight]) => ({ exercise, weight, isNew: true }));
  
  return {
    prs,
    prCount: prs.length,
    notableLifts: Object.entries(rangeBest)
      .map(([exercise, weight]) => ({ exercise, weight }))
      .sort((a, b) => b.weight - a.weight)
  };
}
```

## Data Flow

```
Database Collections
    ↓
Server Aggregation (reports service)
    ↓
Pre-aggregated Summary (JSON)
    ↓
Client Render (report components)
    ↓
Export (CSV/PDF from same data)
```

## Migration Considerations

**None required**. Reports aggregate from existing collections without modifying them. The `{ owner, date }` indexes already exist for efficient date-range queries.

## Validation Rules

### Date Range Validation

```javascript
// Server-side validation
const dateRangeSchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
}).refine(data => {
  const fromDate = new Date(data.from);
  const toDate = new Date(data.to);
  return fromDate <= toDate;
}, { message: 'from date must be before or equal to to date' });
```

### Report Type Validation

```javascript
const reportTypeSchema = z.enum(['overview', 'workout', 'nutrition', 'progress']);
```
