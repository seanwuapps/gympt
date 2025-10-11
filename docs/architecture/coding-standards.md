# Coding Standards (MVP)

- TypeScript everywhere; strict mode in tsconfig.
- Server secrets only in server routes; never expose AI keys client-side.
- Validate all AI responses with Zod before persisting.
- Enforce RLS; every table scoped by `user_id` or parent FK.
- API routes: `server/api/**` use POST for mutations; return typed JSON.
- UI: mobile-first, large tap targets; minimal text; accessible color contrast.
- Logging: minimal server logs; redact PII; store AI audit payloads safely.
- Migrations: only via Drizzle; no manual DB changes.
