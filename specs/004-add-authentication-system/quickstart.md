# Phase 1 — Quickstart

## Prerequisites
- Supabase project with Google OAuth enabled
- Redirect URLs configured for each environment:
  - Local: http://localhost:<port>
  - Dev: https://<dev-domain>
  - Prod: https://<prod-domain>
- Nuxt project with @nuxtjs/supabase module installed and configured

## Steps
1. Start the app locally.
2. Click "Continue with Google".
3. Approve provider consent.
4. Verify redirect returns to the same origin (localhost when starting locally).
5. Confirm UI reflects authenticated state and protected routes are accessible.
6. Sign out and verify protected routes are no longer accessible.
7. Optional: Start in dev/prod and verify redirects return to matching environment origins.

## Expected Outcomes
- Authenticated users can access protected routes; unauthenticated users are redirected to the sign-in surface.
- Session behavior and rate limiting follow provider defaults.
- Concurrent sessions across devices are allowed.
