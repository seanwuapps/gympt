# Architecture — AI Training Companion

## 1. Overview

Nuxt 4 application (Vue 3 + TS) with custom vanilla UI components, Supabase (Postgres + Auth), Drizzle ORM, and Cloudflare Workers AI via an OpenAI-compatible API. Server routes in Nuxt handle AI calls and data mutations securely. Deployed on Cloudflare Pages.

## 2. Component Diagram

```mermaid
graph TD
  U[User (Mobile Web)] --> NU[Nuxt 4 App]
  NU --> SR[Nuxt Server Routes]
  SR --> DB[(Supabase Postgres)]
  SR --> AI[Cloudflare Workers AI (OpenAI-compatible)]
  NU --> SUPA[Supabase Auth (Google OAuth)]
```

## 3. Project Structure (high level)

- `pages/` — index, login, onboarding, plans/, profile/, session/, progress
- `components/base/` — vanilla UI components (BaseButton, BaseCard, BaseDialog, etc.)
- `components/` — feature components (plans/, profile/, onboarding/, form/, display/, layout/)
- `composables/` — `useToast.ts`
- `stores/` — Pinia stores (plans, session, profile, onboarding)
- `server/api/` — `ai/session.generate.post.ts`, `sessions/[id]/swap-exercise.post.ts`, `plans/`, `profile`
- `db/schema/` — Drizzle tables (profiles, training-plans, sessions)
- `db/migrations/` — generated migrations

## 4. Data Model (Drizzle → Supabase)

- `profiles`: user_id (uuid, pk), units, language, aggressiveness
- `plans`: id, user_id, goal, modalities[], start_date, end_date, status
- `weeks`: id, plan_id, week_number
- `sessions`: id, user_id, plan_id, week_id, date, modality, status, notes
- `session_exercises`: id, session_id, order, name, type, targets jsonb, rest_seconds, llm_prompt_id, llm_model
- `sets`: id, session_exercise_id, set_number, target jsonb, actual jsonb, completed_at
- `feedback_sessions`: session_id (pk), session_rpe, difficulty, soreness_flags[], injury_flag, notes
- `metrics`: id, user_id, date, lift?, e1rm?, total_volume?, duration?, hr_avg?, hr_max?
- `ai_audit`: id, user_id, request, response, model, created_at

Notes: `jsonb` targets by modality; FK cascades; indices on `user_id`, `date`.

## 5. Security & RLS

- Enable RLS on all tables.
- Policies: user can only access records where `auth.uid() = user_id` (or via parent FK).
- Service role key used only in server routes for admin tasks; never exposed to client.

## 6. AI Integration

- Use OpenAI SDK on server with `baseURL = process.env.OPENAI_BASE_URL` and `apiKey = process.env.OPENAI_API_KEY`.
- Default model: `process.env.OPENAI_MODEL` (MVP: `@cf/meta/llama-4-scout-17b-16e-instruct`).
- Strict JSON contracts validated with Zod; retries with schema hinting; audit stored in `ai_audit`.

## 7. Server API Contracts

- `POST /api/ai/session.generate`
  - Input: profile, modality, day, constraints
  - Output: `{ exercises: Exercise[] }` (strict Zod schema)
- `POST /api/ai/exercise.substitute`
  - Input: current exercise + constraints
  - Output: `Exercise`
- `POST /api/adapt/next-session`
  - Input: recent session logs + feedback
  - Output: adjusted targets summary

## 8. Adaptation Rules (deterministic)

- Strength: RPE ≥ 9 or missed reps → −5% (or −1 rep); RPE 4–6 with all reps → +2.5–5%.
- Cardio: hard → reduce duration/zone; easy → +5–10% duration or higher zone.
- HIIT: struggling → more rest/less work; easy → less rest or +1 round (caps).
- Crossfit: scale next WOD if low output; cap weekly growth ≈10%.
- Rehab: pain ceiling 3/10; small increments only.

## 9. Environment & Secrets

- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`, `OPENAI_BASE_URL`, `OPENAI_MODEL`
- `NUXT_APP_URL`

## 10. Dev Standards (see shards)

- `docs/architecture/coding-standards.md`
- `docs/architecture/tech-stack.md`
- `docs/architecture/source-tree.md`

## 11. Deployment

- Local dev: `pnpm dev`. Hosting later (Netlify/Vercel) with Supabase envs.
- Add CI for lint/build and Drizzle migrations.
