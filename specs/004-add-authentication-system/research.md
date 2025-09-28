# Phase 0 Research — Authentication System (Google-only)

## Decisions
- Auth method: Google OAuth only
- MFA: Not required
- Email/password: Not required
- Session policy: Supabase defaults
- Rate limiting: Supabase defaults
- Concurrent sessions: Allowed (no custom handling)
- Email verification: Not required
- Audit logging: None
- Redirect policy: Environment-aware (local/dev/prod return to same origin)
- Framework: Nuxt 3 with @nuxtjs/supabase
- Testing approach: Vitest + Playwright (proposed)

## Rationale
- Google-only reduces scope and complexity while meeting user needs.
- Provider defaults for session and rate limiting minimize app logic and maintenance.
- Environment-aware redirects avoid cross-origin mismatches during OAuth and clarify expected behavior in each environment.
- No audit logs per scope decision; can be added later if compliance needs arise.

## Alternatives Considered
- Multi-provider OAuth: deferred to reduce complexity.
- Email/password: explicitly excluded for this feature.
- Custom session policies / rate limiting: rely on provider to minimize app surface area.
- Audit logging: excluded for scope; platform/infra solutions can be revisited later.

## Open Issues
- None blocking. Account deletion data handling is governed by organizational policy and out of scope here.
