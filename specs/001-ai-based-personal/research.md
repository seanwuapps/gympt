# Research: AI-based Personal Training Companion (Phase 0)

Date: 2025-09-27
Spec: C:/dev/gympt/specs/001-ai-based-personal/spec.md
Plan: C:/dev/gympt/specs/001-ai-based-personal/plan.md

## Decisions

 - Language/Runtime: TypeScript on Node.js (LTS); package manager pnpm; Framework: Nuxt 4 + Nuxt UI [DM, SF]
 - Storage (MVP): Supabase Postgres — single database [SF]
 - ORM: Drizzle ORM [DM]
 - AI: OpenAI SDK configured for OpenRouter baseURL/auth [DM]
  - UI Target: Web app, mobile-first layout; consider PWA later (offline explicitly out of scope for MVP) [SF]
  - Analytics: Session cadence, weekly volume load, estimated 1RM trend [Spec Clarifications]
  - Feedback capture: 5-point effort rating after each session + optional free-text comment [Spec Clarifications]
  - Offline: Out of scope for MVP; assume online connectivity during workouts [Spec Clarifications]
  - Export: None for MVP; data retained in DB with no automatic retention limit [Spec Clarifications]
  - Charts dependency: Deferred until analytics UI implementation [DM]

## Rationale

 - TypeScript + Node LTS with Nuxt 4 maximizes productivity while keeping complexity low [RP, SF].
 - Supabase Postgres gives managed persistence for MVP with minimal ops overhead; single database aligns with simplicity [SF].
  - Web app enables quick iteration and broad device support; mobile-first addresses gym usage context [SF].
 - Selected analytics serve the core value proposition (progress visibility) with minimal complexity [SF].
 - Deferring charting library avoids premature dependency lock-in; choose at analytics UI implementation [DM].
 - OpenRouter keeps provider flexibility and broad model access while using a single OpenAI SDK client [DM].

## Alternatives Considered

 - SQLite for MVP: Simple, but not aligned with desired cloud persistence; keep as local dev option [SF].
  - Native mobile (iOS/Android): Higher initial investment; revisit if PWA insufficient [SF].
  - Heavy ORMs: Prefer query builders or light mappers initially to reduce coupling/overhead [DM].

## Open Questions (Deferred)

- Authentication/account model (anonymous vs account, SSO) — defer beyond MVP.
- Multi-user/team sharing; coach features — future scope.

## Risks & Mitigations

- Analytics correctness: Validate formulae (1RM estimation, volume aggregation) via unit tests and quickstart scenarios [TDT].
- Data model evolution: Start normalized with migration plan; keep schemas small and composable [SF, CA].
- Scope creep in UI: Enforce minimal UI per session; one screen focus with progressive disclosure [SF].

## References

- 1RM Estimation methods (e.g., Epley, Brzycki) — choose one simple formula for MVP.
- Accessibility & mobile ergonomics guidelines (tap targets, contrast).
