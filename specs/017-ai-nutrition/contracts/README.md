# API Contracts: AI-Powered Nutrition Page (017-ai-nutrition)

**Stage**: /sp.plan — Phase 1 (Design & Contracts)
**Date**: 2026-09-13

## Summary

Day 12 adds **exactly one new backend endpoint** — the auth-scoped Gemini analysis proxy. Everything else reuses the existing owner-scoped Nutrition surface unchanged.

| Endpoint | Change | Auth | Writes |
|----------|--------|------|--------|
| `POST /api/nutrition/analyze` | **NEW** | required (`authenticate`) | no — stateless proxy to Gemini |
| `POST/GET/GET :id/PATCH/DELETE /api/nutrition*` + `GET /api/nutrition/summary/daily` | unchanged | required | unchanged |
| `GET/POST /api/dashboard*`, `reports/*` | unchanged | required | unchanged |

## Environment

- `GEMINI_API_KEY` — **NEW, server-only, OPTIONAL at boot**. Placeholder added to `backend/.env.example` (never a real value). When absent, `POST /api/nutrition/analyze` returns `503 AI_UNCONFIGURED`; the app boots and manual logging works (constitution Day 12). No other env vars.

## Data / Schema Changes

- Additive optional `source` (`'ai' | 'manual'`, default `'manual'`, not indexed) on the `Nutrition` model + optional `source` in the create zod schema. No summary-math or consumer change. See [data-model.md](../data-model.md).

## Contract Reference

- [POST-nutrition-analyze.md](./POST-nutrition-analyze.md) — full request/response/error contract for the new endpoint (OpenAPI 3.1-style description; the repo's prior backend features document endpoint contracts this way).

## Authentication

All `/api/nutrition*` routes (including `/analyze`) are gated by `authenticate` (`httpOnly` cookie). Missing/invalid/expired token → `401 UNAUTHORIZED`. Every nutrition query filters `{ owner: req.userId }`; cross-user access → `404 NOT_FOUND`.