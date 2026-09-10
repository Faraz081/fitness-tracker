# API Contract: GET /api/reports/nutrition

**Date**: 2026-09-10
**Feature**: 011-reports-export

## Endpoint

```
GET /api/reports/nutrition?from=YYYY-MM-DD&to=YYYY-MM-DD
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
      "totalCalories": 45200,
      "avgDailyCalories": 1506.7,
      "totalProtein": 2250,
      "avgDailyProtein": 75.0,
      "totalCarbs": 5600,
      "avgDailyCarbs": 186.7,
      "totalFat": 1500,
      "avgDailyFat": 50.0,
      "daysLogged": 28
    },
    "mealTypeBreakdown": [
      { "mealType": "breakfast", "entries": 45, "calories": 12000, "protein": 600, "carbs": 1500, "fat": 400 },
      { "mealType": "lunch", "entries": 38, "calories": 15000, "protein": 750, "carbs": 1800, "fat": 500 },
      { "mealType": "dinner", "entries": 35, "calories": 14000, "protein": 700, "carbs": 1700, "fat": 450 },
      { "mealType": "snack", "entries": 20, "calories": 4200, "protein": 200, "carbs": 600, "fat": 150 }
    ],
    "dailyTotals": [
      { "date": "2026-08-11", "calories": 1800, "protein": 90, "carbs": 220, "fat": 60 },
      { "date": "2026-08-12", "calories": 2100, "protein": 105, "carbs": 260, "fat": 70 }
    ],
    "meals": [
      {
        "id": "507f1f77bcf86cd799439012",
        "date": "2026-09-05",
        "mealType": "breakfast",
        "foodName": "Oatmeal",
        "quantity": 1,
        "unit": "bowl",
        "calories": 300,
        "protein": 10,
        "carbs": 50,
        "fat": 5
      }
    ],
    "goalComparison": null
  }
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `dateRange.from` | string | Applied start date |
| `dateRange.to` | string | Applied end date |
| `dateRange.days` | number | Number of days in range |
| `summary.totalCalories` | number | Sum of calories in range |
| `summary.avgDailyCalories` | number | Average daily calories (over logged days) |
| `summary.totalProtein` | number | Sum of protein (g) in range |
| `summary.avgDailyProtein` | number | Average daily protein (g) |
| `summary.totalCarbs` | number | Sum of carbs (g) in range |
| `summary.avgDailyCarbs` | number | Average daily carbs (g) |
| `summary.totalFat` | number | Sum of fat (g) in range |
| `summary.avgDailyFat` | number | Average daily fat (g) |
| `summary.daysLogged` | number | Days with at least one nutrition entry |
| `mealTypeBreakdown` | array | Nutrition grouped by meal type |
| `mealTypeBreakdown[].mealType` | string | Meal type (breakfast/lunch/dinner/snack) |
| `mealTypeBreakdown[].entries` | number | Number of entries |
| `mealTypeBreakdown[].calories` | number | Total calories |
| `mealTypeBreakdown[].protein` | number | Total protein (g) |
| `mealTypeBreakdown[].carbs` | number | Total carbs (g) |
| `mealTypeBreakdown[].fat` | number | Total fat (g) |
| `dailyTotals` | array | Daily nutrition totals |
| `dailyTotals[].date` | string | Date (YYYY-MM-DD) |
| `dailyTotals[].calories` | number | Daily calories |
| `dailyTotals[].protein` | number | Daily protein (g) |
| `dailyTotals[].carbs` | number | Daily carbs (g) |
| `dailyTotals[].fat` | number | Daily fat (g) |
| `meals` | array | List of meals in range |
| `meals[].id` | string | Nutrition entry ID |
| `meals[].date` | string | Meal date |
| `meals[].mealType` | string | Meal type |
| `meals[].foodName` | string | Food name |
| `meals[].quantity` | number | Quantity |
| `meals[].unit` | string | Unit |
| `meals[].calories` | number | Calories |
| `meals[].protein` | number | Protein (g) |
| `meals[].carbs` | number | Carbs (g) |
| `meals[].fat` | number | Fat (g) |
| `goalComparison` | object | Goal comparison (null if no goal) |

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

- Server aggregates from owner-scoped nutrition collection
- Totals computed server-side (Principle VIII)
- Daily averages = total / days with entries
- Meal type breakdown sums to range totals
- Goal comparison only when persisted calorie/macro goal exists
- All queries filtered by `{ owner: req.userId }`
