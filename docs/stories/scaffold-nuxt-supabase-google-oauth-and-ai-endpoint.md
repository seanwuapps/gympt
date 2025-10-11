# Story: Scaffold Nuxt 4 app with Supabase Google OAuth, Drizzle ORM, and Cloudflare AI endpoint

## Context
Based on `docs/prd.md` and `docs/architecture.md`, we need to initialize a Nuxt 4 project (Vue 3 + TS) with Element Plus, configure Supabase (Google OAuth) and Drizzle ORM, and create initial server API routes for Cloudflare Workers AI (OpenAI-compatible) using model `@cf/meta/llama-4-scout-17b-16e-instruct`.

## Objectives
- Create a runnable Nuxt 4 app at project root using pnpm.
- Integrate `@nuxtjs/supabase` with Google OAuth sign-in/out flows.
- Add Element Plus plugin.
- Install Drizzle ORM and create initial config and empty schema folder.
- Add server AI endpoint stubs with strict Zod JSON validation.
- Prepare `.env` variables (documented; no secrets committed).

## Acceptance Criteria
- Auth
  - User can click "Sign in with Google" and complete OAuth via Supabase in dev (`http://localhost:3000`).
  - Session state is available via Supabase composables; sign-out works.
- AI Endpoint
  - `POST /api/ai/session.generate` responds 200 with a valid JSON payload matching the Zod schema when given a minimal valid input (for now may return a mocked stub if Cloudflare creds are not provided).
  - Endpoint uses OpenAI SDK with `baseURL`/`apiKey` from env and `OPENAI_MODEL=@cf/meta/llama-4-scout-17b-16e-instruct`.
- Drizzle
  - `drizzle.config.ts` present; `db/schema/` exists.
  - Can run `drizzle-kit generate` (no tables yet) without errors.
- UI
  - Element Plus is installed and renders a basic layout.

## Tasks
1. Initialize Nuxt 4 project (pnpm) at repository root.
2. Install runtime deps: `element-plus`, `@element-plus/icons-vue`, `@nuxtjs/supabase`, `openai`, `zod`.
3. Install dev deps: `drizzle-orm`, `drizzle-kit`, `postgres`, `@types/node`, `eslint`, `prettier`.
4. Configure `nuxt.config.ts` with `@nuxtjs/supabase` and TypeScript strict.
5. Add `plugins/element-plus.client.ts` to register Element Plus.
6. Create `.env.example` documenting required env vars: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, `OPENAI_BASE_URL`, `OPENAI_MODEL`, `NUXT_APP_URL`.
7. Add server routes:
   - `server/api/ai/session.generate.post.ts`
   - `server/api/ai/exercise.substitute.post.ts` (stub)
   - `server/api/adapt/next-session.post.ts` (stub)
   Each validates inputs/outputs with Zod and reads secrets from `process.env`.
8. Add a simple page with a "Sign in with Google" button and post-login session display.
9. Document local OAuth settings (Supabase & Google Console) in `README.md` section.

## Definition of Done
- All acceptance criteria satisfied.
- `pnpm dev` runs successfully; home page loads; Google sign-in works in dev.
- AI endpoint returns valid JSON (real or stubbed if no creds).
- Code lint/build passes; no secrets committed.

## QA Hooks
- Run `@qa *risk {this-story}` after drafting (before coding) to identify risks.
- Run `@qa *design {this-story}` to outline test strategy.
- After implementation, run `@qa *review {this-story}` and then `@qa *gate {this-story}`.
