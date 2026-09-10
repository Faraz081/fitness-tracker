# API Contract: GET /api/reports/workout

**Date**: 2026-09-10
**Feature**: 011-reports-export

## Endpoint

```
GET /api/reports/workout?from=YYYY-MM-DD&to=YYYY-MM-DD
```

## Authentication

Required. All requests must include valid JWT token via httpOnly cookie.

## Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `from` | string | No | Last 30 days | Start date (inclusive), format: `YYYY-MM-DD` |
| `to` | string | No | Today | End date (inclusive), format: `YYYY-MM-DD` |

## Request Headers

```
Cookie: access_token=<jwt_token>
```

## Request Body

None.

## Response

### Success (200 OK)

```json
{
  "success": true,
  "data": {
    "dateRange": {
      "from": "2026-08-11",
      "to": "2026-09-10",
      "days": 31
    },
    "summary": {
      "totalWorkouts": 12,
      "totalVolume": 15400.5,
      "avgSessionsPerWeek": 2.7,
      "frequencySeries": [
        { "date": "2026-08-11", "count": 1 },
        { "date": "2026-08-14", "count": 2 },
        { "date": "2026-08-18", "count": 1 }
      ]
    },
    "categoryBreakdown": [
      { "category": "strength", "count": 8, "percentage": 67 },
      { "category": "cardio", "count": 3, "percentage": 25 },
      { "category": "flexibility", "count": 1, "percentage": 8 }
    ],
    "workouts": [
      {
        "id": "507f1f77bcf86cd799439011",
        "name": "Push Day",
        "category": "strength",
        "date": "2026-09-05",
        "volume": 1240.0,
        "exerciseCount": 4,
        "prCount": 1
      }
    ],
    "notableLifts": [
      { "exercise": "Bench Press", "weight": 80 },
      { "exercise": "Squat", "weight": 120 }
    ],
    "prCount": 2,
    "notTracked": {
      "duration": true,
      "muscleGroups": true
    }
  }
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `dateRange.from` | string | Applied start date |
| `dateRange.to` | string | Applied end date |
| `dateRange.days` | number | Number of days in range |
| `summary.totalWorkouts` | number | Count of workouts in range |
| `summary.totalVolume` | number | Total volume (sets × reps × weightKg) |
| `summary.avgSessionsPerWeek` | number | Average sessions per week |
| `summary.frequencySeries` | array | Daily workout counts |
| `categoryBreakdown` | array | Workouts grouped by category |
| `workouts` | array | List of workouts in range |
| `workouts[].id` | string | Workout ID |
| `workouts[].name` | string | Workout name |
| `workouts[].category` | string | Workout category |
| `workouts[].date` | string | Workout date |
| `workouts[].volume` | number | Workout total volume |
| `workouts[].exerciseCount` | number | Number of exercises |
| `workouts[].prCount` | number | Personal records in this workout |
| `notableLifts` | array | Best lifts by exercise |
| `notableLifts[].exercise` | string | Exercise name |
| `notableLifts[].weight` | number | Best weight (kg) |
| `prCount` | number | Total PRs in range |
| `notTracked.duration` | boolean | Always true (duration not tracked) |
| `notTracked.muscleGroups` | boolean | Always true (muscle groups not tracked) |

### Validation Error (400 BAD REQUEST)

```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "field": "from",
        "message": "Invalid date format"
      }
    ]
  }
}
```

### Unauthorized (401 UNAUTHORIZED)

```json
{
  "success": false,
  "error": {
    "message": "Unauthorized",
    "code": "UNAUTHORIZED"
  }
}
```

## Implementation Notes

- Server aggregates from owner-scoped workout collection
- Volume = sum(exercises.map(e => e.sets × e.reps × (e.weightKg || 0)))
- Avg sessions per week = (workout count / range days) × 7
- Frequency series: daily buckets, aggregated to weekly for large ranges
- PRs: range best weight > historical best weight per exercise
- Not tracked: duration and muscle groups always show "Not tracked"
- All queries filtered by `{ owner: req.userId }`
