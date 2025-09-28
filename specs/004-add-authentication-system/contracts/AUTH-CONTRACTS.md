# Phase 1 — Auth Contracts

## Overview
Auth uses Google OAuth only via provider defaults. No new backend endpoints are introduced in this feature.

## Route Guards (UI/Client)
- Protected routes MUST require an authenticated session.
- On unauthenticated access, redirect to the sign-in page.
- If an authenticated user visits the sign-in page, redirect to dashboard/home.

## Redirect Policy (Environment-Aware)
- The OAuth flow MUST return to the same environment origin where it was initiated.
  - Local: http://localhost:<port>
  - Dev: https://<dev-domain>
  - Prod: https://<prod-domain>
- Mismatched callback (e.g., initiated on localhost but redirected to dev) is treated as misconfiguration → fail safely with a clear error and guidance.

## Error States
- Provider denial/cancel → show error and allow retry.
- Network/SDK errors → show error and allow retry.

## Out of Scope
- Audit event logging
- MFA
- Email/password flows
- Custom session/rate-limiting policies
