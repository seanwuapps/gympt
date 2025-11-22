# Product Requirements Document (PRD) — AI Training Companion

## 1. Vision

A mobile‑first AI training companion that generates and adapts training plans and sessions across strength, cardio, HIIT, crossfit, and rehabilitation. It guides the user through sessions with a minimal step‑focused UI, captures feedback, and adapts subsequent sessions. Provides session and weekly reports.

## 2. Scope (Phase 1: MVP Foundation)

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
  - Generate initial training plan as final onboarding step.
- AI Training Plan Generation
  - Generate multi-week high-level training plan based on user profile (goals, experience, preferred training days, equipment, injuries).
  - AI determines plan duration based on fitness level and goals.
  - Plan maps each preferred training day to training focus/modality (e.g., Mon: Chest, Tue: Back+Cardio, Wed: Rest).
  - Plans stored in DB; user can generate multiple plans and switch between them.
  - Only one active plan at a time; user can switch active plan mid-cycle.
  - Plan management: view all plans, set active plan, delete plans.
  - Entry points: final onboarding step, home page (if no active plan), dedicated plan management page.
  - High-level plan not affected by individual session feedback.
- AI Session Generation
  - For a selected day from active training plan, generate detailed session with AI-generated exercises and targets.
  - Session generation uses plan day focus + user profile + recent performance history.
  - Substitutions available on-demand via AI given constraints.
  - Session targets adapt based on previous session feedback (load/volume progression).
- Session Runner
  - Show one exercise at a time with target info and controls to log actual values.
  - Auto rest timer after set completion; allow skip/replace exercise.
- Feedback & Adaptation
  - End-of-session questionnaire: session RPE, perceived difficulty, notes, soreness/injury flags.
  - Next session targets adjusted via deterministic rules per modality; safety caps on load/volume progression.
  - Feedback affects future session generation, not the high-level training plan.
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

## 11. Delivery Roadmap

### Phase 1: MVP Foundation (Months 1-4)

**Goal:** Launch functional MVP for early adopters.

- **M1.1:** User Auth & Profile (Supabase).
- **M1.2:** AI Training Plan Generation.
- **M1.3:** Session Runner & Logging.
- **M1.4:** Basic Analytics (Session/Weekly).
- **M1.5:** Beta Launch.

### Phase 2: Market Validation (Months 4-6)

**Goal:** Validate fit and expand compatibility.

- **M2.1:** Integrations (Google Fit / Apple Health).
- **M2.2:** UX Refinement from feedback.
- **M2.3:** Public Launch.

### Phase 3: Premium Tier (Months 6-9)

**Goal:** Monetization via subscription.

- **M3.1:** Advanced Analytics (Heatmaps, Trends).
- **M3.2:** Training Intelligence ("Why this exercise?", Recovery).
- **M3.3:** Subscription System (Stripe/RevenueCat).

### Phase 4: Ecosystem (Months 9-15)

**Goal:** Premium experiences and add-ons.

- **M4.1:** Real-Time Video Form Check (WebRTC).
- **M4.2:** Generative AI Music.
- **M4.3:** Persona-based AI Trainers.
- **M4.4:** Add-on Marketplace.

### Phase 5: Scale (Ongoing)

- **M5.1:** Marketplace Expansion.
- **M5.2:** Internationalization.
- **M5.3:** Offline-first & Wearables.

## 12. Monetization Strategy

- **Free Tier (Phases 1-2):**
  - Full access to core training features (Plan Gen, Session Runner, Basic Logs).
  - Focus on user acquisition and retention.

- **Tier 1 Subscription (Phase 3+):**
  - **Price:** ~$5-10/month (TBD).
  - **Features:** Advanced analytics, deep insights, recovery tracking, unlimited plan generations (if capped on free).

- **Add-ons / Marketplace (Phase 4+):**
  - One-time or sub-add-ons for specific AI trainers, specialized programs, or advanced media features.
