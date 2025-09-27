# Tasks: AI-based Personal Training Companion

**Input**: Design documents from `/specs/001-ai-based-personal/`
**Prerequisites**: `plan.md` (required), `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → Extract: tech stack, libraries, structure (Node LTS, pnpm, Nuxt 4 + Nuxt UI, Supabase Postgres, Drizzle ORM, OpenAI SDK w/ Cloudflare Workers AI)
2. Load optional design documents:
   → data-model.md: Extract entities → model tasks
   → contracts/: Each file → contract test task
   → research.md & quickstart.md: Extract decisions & scenarios → setup/tests
3. Generate tasks by category:
   → Setup → Tests → Models → Services → Endpoints → UI → Integration → Polish
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Create dependency graph and parallel examples
7. Validate completeness: contracts→tests, entities→models, endpoints→impl
```

## Path Conventions
- Single project Nuxt 4 app at repository root
- Server (Nuxt Nitro): `server/api/`, `server/services/`, `server/db/`
- UI: `pages/`, `components/`
- Tests: `tests/contract/`, `tests/integration/`, `tests/unit/`

---

## Phase 3.1: Setup
- [ ] T001 Initialize Nuxt 4 project (Node LTS, pnpm)
  - Create `nuxt.config.ts` with mobile-first defaults and Nuxt UI
  - Ensure `package.json` uses pnpm and Node LTS engines
- [ ] T002 Install base dependencies
  - Nuxt 4, Nuxt UI, TypeScript, Vitest, @vitest/ui, jsdom, supertest or undici, Zod
- [ ] T003 Install data layer
  - Drizzle ORM, drizzle-kit, postgres driver (or neon/pg) for Supabase connection
  - Create `drizzle.config.ts`
- [ ] T004 Configure database env
  - Create `.env.example` with `DATABASE_URL`, `AI_BASE_URL`, `AI_API_KEY`, `AI_MODEL`
  - Add `server/db/env.ts` to read/validate env (Zod)
- [ ] T005 [P] Configure linting/formatting
  - ESLint + Prettier baseline
- [ ] T006 [P] Scaffolding files
  - `server/db/client.ts` (Drizzle connection)
  - `server/db/schema.ts` (empty with TODO section headers)
  - `server/services/aiService.ts` (OpenAI SDK client wrapper with configurable baseURL/apiKey)

## Phase 3.2: Tests First (TDD) — MUST FAIL BEFORE 3.3
Contract tests from `contracts/openapi.yaml`:
- [ ] T007 [P] Contract test POST /users → `tests/contract/users.post.spec.ts`
- [ ] T008 [P] Contract test POST /plans/generate → `tests/contract/plans.generate.post.spec.ts`
- [ ] T009 [P] Contract test GET /sessions/today → `tests/contract/sessions.today.get.spec.ts`
- [ ] T010 [P] Contract test POST /sessions/{id}/logs → `tests/contract/sessions.logs.post.spec.ts`
- [ ] T011 [P] Contract test POST /sessions/{id}/complete → `tests/contract/sessions.complete.post.spec.ts`
- [ ] T012 [P] Contract test GET /analytics → `tests/contract/analytics.get.spec.ts`

Integration tests from `quickstart.md`:
- [ ] T013 [P] Integration test: plan generation flow → `tests/integration/plan_flow.spec.ts`
- [ ] T014 [P] Integration test: logging flow & summary → `tests/integration/logging_flow.spec.ts`
- [ ] T015 [P] Integration test: analytics KPIs → `tests/integration/analytics_flow.spec.ts`

## Phase 3.3: Data Models (from data-model.md)
- [ ] T016 [P] Create Drizzle schema in `server/db/schema.ts` for:
  - user_profile, training_plans, session_plans, exercises, sessions,
  - session_exercise_logs, session_set_logs, session_feedbacks
- [ ] T017 Generate initial migrations via drizzle-kit → `migrations/`
- [ ] T018 Add derived views/queries for analytics aggregations (read-time)

## Phase 3.4: Core Services
- [ ] T019 [P] `server/services/planService.ts` — generate plan and session plans per spec
- [ ] T020 [P] `server/services/sessionService.ts` — session lifecycle, logs, summary
- [ ] T021 [P] `server/services/analyticsService.ts` — cadence, volume load, 1RM trend
- [ ] T022 `server/services/aiService.ts` — implement OpenAI SDK client with Cloudflare Workers AI baseURL/auth (env)

## Phase 3.5: Endpoints (Nuxt server/api)
- [ ] T023 POST `server/api/users.post.ts` — upsert user profile
- [ ] T024 POST `server/api/plans/generate.post.ts`
- [ ] T025 GET `server/api/sessions/today.get.ts`
- [ ] T026 POST `server/api/sessions/[sessionId]/logs.post.ts`
- [ ] T027 POST `server/api/sessions/[sessionId]/complete.post.ts`
- [ ] T028 GET `server/api/analytics.get.ts`

## Phase 3.6: UI (Nuxt + Nuxt UI)
- [ ] T029 Install and configure Nuxt UI, set theme and mobile-first defaults
- [ ] T030 Create `pages/index.vue` — dashboard (streaks, cadence, quick actions)
- [ ] T031 Create `pages/today.vue` — focused workout flow (exercise card → set logging)
- [ ] T032 Create `components/ExerciseCard.vue` and `components/SetLogger.vue`
- [ ] T033 Post-session summary modal with 5-point rating + optional comment
- [ ] T034 Analytics views: cadence, weekly volume, 1RM trend (charts library TBD)

## Phase 3.7: Integration
- [ ] T035 Wire Drizzle client to Supabase Postgres via `DATABASE_URL`
- [ ] T036 Input validation with Zod for all endpoint payloads
- [ ] T037 Basic error handling and logging middleware (Nitro event handler)
- [ ] T038 Seed script for exercise catalog → `scripts/seed-exercises.ts`

## Phase 3.8: Polish
- [ ] T039 [P] Unit tests for services: planService, sessionService, analyticsService → `tests/unit/*.spec.ts`
- [ ] T040 Performance sanity checks for API endpoints (<200ms p95 local)
- [ ] T041 [P] Update docs: `README` (setup, env), `API.md` (endpoints & payloads)
- [ ] T042 Accessibility pass (tap targets, contrast)

## Dependencies
- Tests (T007–T015) MUST precede implementation (T016+)
- T016 blocks T017, T019–T021
- T019 blocks T022–T028
- T023–T028 depend on corresponding services and schema
- UI tasks depend on endpoints existence for data

## Parallel Execution Examples
```
# Example Group 1 (contracts) [P]
T007, T008, T009, T010, T011, T012

# Example Group 2 (models/services) [P]
T016, T018, T019, T020, T021

# Example Group 3 (UI) [P]
T030, T031, T032, T033, T034
```

## Validation Checklist
- [ ] All contracts have corresponding tests (T007–T012)
- [ ] All entities have model tasks (T016)
- [ ] All tests come before implementation
- [ ] Parallel tasks only across different files
- [ ] Each task specifies exact file paths
- [ ] Scope adheres to MVP: no offline, no export

## Additional Tasks for FR-008 (Swap Exercise)

- [ ] T043 [P] Contract test POST /sessions/{id}/swap → `tests/contract/sessions.swap.post.spec.ts`
- [ ] T044 Implement `swapExercise(sessionId, fromExerciseId, toExerciseId)` in `server/services/sessionService.ts`
- [ ] T045 POST `server/api/sessions/[sessionId]/swap.post.ts`
- [ ] T046 [P] Integration test: swap exercise scenario → `tests/integration/swap_flow.spec.ts`

Additional Dependencies
- T043 (contract test) before T044–T045
- T044 (service) blocks T045 (endpoint)
- T046 (integration) before implementation if strict TDD is preferred, or after endpoint stub if incremental

Additional Parallel Example
```
# Contracts [P]
T007, T008, T009, T010, T011, T012, T043

# Services/Endpoints [P]
T019, T020, T021, T022, T044, T045
```
