# Test Design — Scaffold Nuxt 4 + Supabase Google OAuth + AI Endpoint (MVP)

## Scope
Covers initial project scaffolding, Google OAuth integration, server AI endpoints, and Drizzle setup readiness.

## Test Objectives
- Validate project boots with `pnpm dev`.
- Verify Google OAuth end-to-end in dev environment (`http://localhost:3000`).
- Ensure AI endpoint returns schema-valid JSON (real call or stub when creds absent).
- Confirm Drizzle config present and migrations command runs.

## Test Strategy
- Levels: unit (server route handlers), integration (OAuth flow with Supabase), E2E (basic app boot and sign-in journey).
- Priorities: P0 (secrets handling, RLS and server-only usage), P1 (OAuth redirects), P1 (AI schema validation), P2 (UI visuals).

## Test Scenarios
- P0 — Secrets
  - `.env` not committed; server routes read `OPENAI_*` only server-side; client bundle free of secrets.
- P1 — OAuth
  - Given Supabase Google provider configured, when user clicks Sign in, then redirected back with session populated.
  - Invalid redirect URL shows clear error and does not log a session.
- P1 — AI Endpoint
  - POST `/api/ai/session.generate` with minimal valid input returns 200 and matches Zod schema (or stub in dev without creds).
  - Invalid input returns 400 with validation errors.
- P2 — Drizzle
  - `drizzle.config.ts` exists; `drizzle-kit generate` runs (even with empty schema) without fatal errors.
- P2 — App Boot
  - `pnpm dev` serves app at `http://localhost:3000`; Element Plus renders a basic component.

## Test Data
- Supabase project with Google OAuth credentials; authorized origins/redirects for localhost.
- Cloudflare API token (optional for real calls).

## CI/CD Hooks (Future)
- Lint/build job.
- Drizzle migration check.
- Minimal route unit tests with Vitest.
