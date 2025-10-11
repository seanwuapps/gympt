# Product Requirements Document (PRD) — AI Training Companion

## 1. Vision
A mobile‑first AI training companion that generates and adapts training plans and sessions across strength, cardio, HIIT, crossfit, and rehabilitation. It guides the user through sessions with a minimal step‑focused UI, captures feedback, and adapts subsequent sessions. Provides session and weekly reports.

## 2. Scope (MVP)
- In scope:
  - Google sign‑in via Supabase Auth.
  - Onboarding to capture goals, experience, schedule, equipment, injuries, units (kg/cm), language (en).
  - AI‑generated sessions (per‑exercise) for modalities: strength, cardio, HIIT, crossfit, rehab. No static exercise library.
  - Session runner: one exercise at a time, big controls, rest timer, quick logging of reps/load/RPE/time/distance.
  - End‑session feedback (session RPE/difficulty/notes, soreness/injury flags).
  - Deterministic adaptation engine adjusts next session targets based on feedback and recent performance.
  - Reports: session report and weekly progress report.
- Out of scope (MVP):
  - Offline support (assume always online).
  - Social/sharing; coach features; payment.
  - Localization beyond English; units beyond metric (later).

## 3. Users & Assumptions
- Users: beginners and intermediates seeking guided training.
- Assumptions: mobile web PWA use; always online; minimal manual data entry; safety-first defaults.

## 4. Functional Requirements
- Auth
  - Sign in with Google via Supabase; sign out; session persistence.
- Onboarding
  - Collect goals, experience, schedule (days per week), available equipment, injury flags, units, language.
  - Create profile and default preferences.
- AI Session Generation
  - For a selected day/modality, generate a session comprised of AI-generated exercises with targets per modality.
  - Substitutions available on-demand via AI given constraints.
- Session Runner
  - Show one exercise at a time with target info and controls to log actual values.
  - Auto rest timer after set completion; allow skip/replace exercise.
- Feedback & Adaptation
  - End-of-session questionnaire: session RPE, perceived difficulty, notes, soreness/injury flags.
  - Next session targets adjusted via deterministic rules per modality; safety caps on load/volume progression.
- Reports
  - Session report: volume or modality metrics, e1RM (strength), adherence, notes.
  - Weekly report: total volume, e1RM trend, PRs, adherence, average session RPE, duration.

## 5. Non‑Functional Requirements
- Mobile-first UX with large tap targets and minimal cognitive load.
- Performance: first load < 3s on typical mobile; interactions < 100ms.
- Security: RLS on all data; secrets only server-side.
- Reliability: avoid data loss during navigation; atomic saves where possible.

## 6. Tech Stack & Integrations
- Frontend: Nuxt 4 (Vue 3 + TypeScript), Element Plus UI.
- Backend/DB: Supabase (Postgres + Auth with Google), Row Level Security.
- ORM: Drizzle ORM (schema/migrations/types).
- AI: Cloudflare Workers AI via OpenAI-compatible API; default model `@cf/meta/llama-4-scout-17b-16e-instruct`.
- Validation: Zod (strict JSON contracts from AI).

## 7. Analytics & Metrics
- Strength: set/rep/load/RPE, per-lift e1RM, total volume.
- Cardio: duration, distance, intensity, HR (if available later).
- HIIT: rounds, work/rest compliance.
- Crossfit: format, duration, components, completion metrics.
- Rehab: pain ceiling adherence, sets/reps completed.

## 8. Acceptance Criteria (selected)
- Auth: user can sign in/out with Google; RLS restricts data to owner.
- Onboarding: profile created with units metric (kg/cm) and English; editable later.
- AI Session Generation: POST endpoint returns valid strict JSON schema; UI renders per-exercise steps.
- Session Runner: user can complete a session, log all sets, view rest timer, skip/replace, finish session.
- Feedback & Adaptation: submission stores feedback and modifies next session targets per rules.
- Reports: session report available immediately; weekly report aggregates last 7 days correctly.

## 9. Risks & Constraints
- AI variability: enforce strict schemas and retries/fallbacks.
- Safety: conservative progression; caps on weekly increases; respect injury flags.
- Cost: model choice tuned for quality vs cost; audit logs for monitoring.

## 10. Outbound APIs & Secrets
- Cloudflare AI via OpenAI-compatible base URL; API token server-only.
- Supabase service role used server-side only; client uses anon key.

## 11. Future (Post‑MVP)
- Offline-first PWA; localization; unit switching; advanced progression aggressiveness setting; coach mode; wearable integrations.
