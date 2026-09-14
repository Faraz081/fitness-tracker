# API Contracts — Nutrition Search (AI-Powered Food Logging) — 018-ai-nutrition-search

**Stage**: /sp.plan — Phase 1 (Design & Contracts)
**Date**: 2026-09-13

## Summary

ONE existing endpoint is used/extended: `POST /api/nutrition/analyze`. All other
Nutrition surface (create/list/get/update/delete/summary) is **unchanged**. There
are no new endpoints, no new env vars, and no new collections (see
[data-model.md](../data-model.md)).

| Endpoint | Change | Contract file |
|----------|--------|---------------|
| `POST /api/nutrition/analyze` | Response extended: gram serving basis + optional `fiber`/`sugar`/`sodium` | [POST-nutrition-analyze.md](./POST-nutrition-analyze.md) |
| `POST /api/nutrition`, `GET /api/nutrition`, `GET /api/nutrition/summary/daily`, `GET/PATCH/DELETE /api/nutrition/:id` | UNCHANGED | — |

## Envelope (unchanged, Principle IV)

Every controller response uses the standard envelope:

- Success: `{ success: true, data: <payload> }` (create → `201`)
- Error: `{ success: false, error: { message, code } }` with an explicit status

## Auth (unchanged)

`nutritionRouter.use(authenticate)` gates the entire router; `req.userId` comes
from the JWT `sub`. The analyze endpoint is auth-scoped and writes nothing.

## Environment (unchanged)

- `GEMINI_API_KEY` — optional at boot, backend-only, `.env.example` placeholder
  only, git-ignored `.env`. Missing key → `503 AI_UNCONFIGURED` (manual logging
  unaffected).
- No other new env vars in this feature.