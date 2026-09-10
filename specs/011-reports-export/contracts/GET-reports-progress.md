# API Contract: GET /api/reports/progress

**Date**: 2026-09-10
**Feature**: 011-reports-export

## Endpoint

```
GET /api/reports/progress?from=YYYY-MM-DD&to=YYYY-MM-DD
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
    "profile": {
      "latestWeight": 82.5,
      "goal": "lose",
      "hasWeightHistory": false
    },
    "consistency": {
      "workoutConsistency": 2.7,
      "nutritionConsistency": 90,
      "nutritionDaysLogged": 28,
      "rangeDays": 31
    },
    "strengthProgression": [
      {
        "exercise": "Bench Press",
        "bestWeight": 80,
        "priorBest": 75,
        "delta": 5
      },
      {
        "exercise": "Squat",
        "bestWeight": 120,
        "priorBest": 115,
        "delta": 5
      }
    ],
    "strengthSeries": [
      {
        "exercise": "Bench Press",
        "points": [
          { "date": "2026-08-12", "weight": 75 },
          { "date": "2026-08-26", "weight": 80 }
        ]
      }
    ],
    "prCount": 2,
    "notTracked": {
      "weightHistory": true,
      "milestones": true,
      "photos": true
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
| `profile.latestWeight` | number | Latest recorded weight (kg) |
| `profile.goal` | string | User's goal from profile |
| `profile.hasWeightHistory` | boolean | Whether weight history covers the range |
| `consistency.workoutConsistency` | number | Average workouts per week |
| `consistency.nutritionConsistency` | number | Nutrition consistency (days logged / range days × 100) |
| `consistency.nutritionDaysLogged` | number | Days with nutrition entries |
| `consistency.rangeDays` | number | Total days in range |
| `strengthProgression` | array | Strength progression per exercise |
| `strengthProgression[].exercise` | string | Exercise name |
| `strengthProgression[].bestWeight` | number | Best weight in range (kg) |
| `strengthProgression[].priorBest` | number | Best weight before range (kg) |
| `strengthProgression[].delta` | number | Weight improvement (kg) |
| `strengthSeries` | array | Best-weight-over-time series per exercise (capped to 40 points) |
| `strengthSeries[].exercise` | string | Exercise name |
| `strengthSeries[].points` | array | Points where the range best increased: `{ date, weight }` |
| `prCount` | number | Total PRs in range |
| `notTracked.weightHistory` | boolean | Always true (weight history not tracked) |
| `notTracked.milestones` | boolean | Always true (milestones not tracked) |
| `notTracked.photos` | boolean | Always true (progress photos not tracked) |

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

- Server aggregates from owner-scoped workout and nutrition collections
- Latest weight from user profile (`user.weightKg`)
- Goal from user profile (`user.goal`)
- Workout consistency = average sessions per week
- Nutrition consistency = days with entries / range days × 100
- Strength progression: best weight in range vs best weight before range
- PRs: range best > historical best per exercise
- Not tracked: weight history, milestones, photos always show "Not tracked"
- All queries filtered by `{ owner: req.userId }`
