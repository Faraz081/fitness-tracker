# API Contracts: Landing Page (8.2)

**Feature**: 012-landing-page

## Status: N/A — no API endpoints exist for this feature

The public Landing Page is a **static, presentational frontend feature**. It performs no data fetching, submits no mutations, and touches no authentication or authorization middleware.

- **No REST endpoints** are defined or added.
- **No backend changes** (no controllers, routes, services, validators, or models).
- **No new environment variables**.
- Content is sourced exclusively from the frontend module `frontend/src/data/landingContent.js` (see [data-model.md](../data-model.md)).

If this feature ever gains dynamic content (e.g., live testimonials), a new contract would be specified under the auth-scoped `/api/*` conventions established by earlier phases. None is required today.