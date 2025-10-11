# Risk Profile — Scaffold Nuxt 4 + Supabase Google OAuth + AI Endpoint (MVP)

## Summary
High-level risks for initial scaffolding and integrations. Scored Probability×Impact (1–9). Items ≥9 → FAIL, ≥6 → CONCERNS.

## Risks
- Technical — Nuxt scaffold in existing dir may clash with existing files (Score 6)
  - Mitigation: scaffold at clean root; commit before run; review diff; avoid destructive commands.
- Security — Exposure of Supabase service role or Cloudflare API token (Score 9)
  - Mitigation: server-only env usage; do not expose to client; .env in gitignore; runtime validation.
- Data — RLS misconfig allows cross-user access (Score 9)
  - Mitigation: RLS-by-default, user_id scoping, integration tests for access; limit service role usage.
- Performance — AI endpoint latency and cost spikes (Score 6)
  - Mitigation: model choice `@cf/meta/llama-4-scout-17b-16e-instruct`; response size constraints; retries with backoff.
- Operational — Google OAuth redirect misconfiguration leading to sign-in failures (Score 6)
  - Mitigation: document exact URLs; verify in Supabase and Google Console; local test checklist.
- Reliability — AI JSON schema non-compliance breaks UI (Score 6)
  - Mitigation: strict Zod validation; schema-hint retry; safe defaults/stubs in dev.

## Gate Impact
- FAIL: Secrets exposure; RLS misconfig.
- CONCERNS: OAuth config friction; AI latency/schema issues.

## Mitigations & Actions
- Create `.env.example`; verify `.gitignore` excludes `.env*`.
- Add server-only AI client; never import on client.
- Add RLS policy templates early and integration checks later.
- Include minimal health endpoint and AI stub for dev without creds.
