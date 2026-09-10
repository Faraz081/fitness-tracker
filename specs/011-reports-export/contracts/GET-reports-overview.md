# API Contract: GET /api/reports/overview

**Date**: 2026-09-10
**Feature**: 011-reports-export

## Endpoint

```
GET /api/reports/overview?from=YYYY-MM-DD&to=YYYY-MM-DD
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
    "workouts": {
      "totalWorkouts": 12,
      "totalVolume": 15400.5
    },
    "nutrition": {
      "totalCalories": 45200,
      "avgDailyCalories": 1506.7,
      "daysLogged": 28
    },
    "progress": {
      "latestWeight": 82.5,
      "weightChange": -1.2,
      "hasWeightHistory": true,
      "goal": "lose",
      "consistencyScore": 43
    }
  }
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `dateRange.from` | string | Applied start date |
| `dateRange.to` | string | Applied end date |
| `dateRange.days` | number | Number of days in range (inclusive) |
| `workouts.totalWorkouts` | number | Count of workouts in range |
| `workouts.totalVolume` | number | Total volume (sets × reps × weightKg) |
| `nutrition.totalCalories` | number | Sum of calories in range |
| `nutrition.avgDailyCalories` | number | Average daily calories (over logged days) |
| `nutrition.daysLogged` | number | Days with at least one nutrition entry |
| `progress.latestWeight` | number | Latest recorded weight (kg) |
| `progress.weightChange` | number | Weight change over range (kg), null if no history |
| `progress.hasWeightHistory` | boolean | Whether weight history covers the range |
| `progress.goal` | string | User's goal from profile |
| `progress.consistencyScore` | number | Active days / range days × 100, null if no activity |

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
- Consistency score = (days with ≥1 workout OR ≥1 nutrition entry) ÷ range days × 100
- Weight change = latest weight in range - earliest weight in range (if history exists)
- All queries filtered by `{ owner: req.userId }`
- Empty results never expose another user's data
