# Tasks: Authentication System (Google-only with Supabase)

**Input**: Design documents from `/specs/004-add-authentication-system/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → Extract: tech stack, libraries, structure
2. Load optional design documents:
   → data-model.md: Extract entities → model tasks
   → contracts/: Each file → contract test task
   → research.md: Extract decisions → setup tasks
   → quickstart.md: Extract validation flows → integration tests
3. Generate tasks by category: Setup → Tests → Core → Integration → Polish
4. Apply task rules: Different files = [P], Same file = sequential, Tests before implementation
5. Number tasks sequentially (T001, T002...)
6. Create dependency notes and parallel examples
7. Return: SUCCESS (tasks ready for execution)
```

## Path Conventions
- Web app assumed under `frontend/` (per plan). If an existing Nuxt app is present elsewhere, adjust paths accordingly.

## Phase 3.1: Setup
- [ ] T001 Create Nuxt 3 app (if not present) in `frontend/`
      Command: `npx nuxi init frontend && cd frontend && pnpm i || npm i`
- [ ] T002 Install and configure Supabase module in `frontend/nuxt.config.ts`
      Command: `cd frontend && pnpm add -D @nuxtjs/supabase || npm i -D @nuxtjs/supabase`
- [ ] T003 [P] Add linting/formatting (ESLint + Prettier) in `frontend/`
      Files: `.eslintrc.cjs`, `.prettierrc`, `package.json` scripts
- [ ] T004 Create `frontend/.env.example` with:
      SUPABASE_URL=...
      SUPABASE_ANON_KEY=...
      (Document local/dev/prod values in README or quickstart)

## Phase 3.2: Tests First (TDD) — MUST FAIL BEFORE IMPLEMENTATION
- [ ] T005 [P] Contract test: unauthenticated access to protected route redirects to `/login`
      File: `frontend/tests/contract/auth.guard.contract.spec.ts`
- [ ] T006 [P] Contract test: authenticated user visiting `/login` redirects to `/`
      File: `frontend/tests/contract/auth.redirect.contract.spec.ts`
- [ ] T007 [P] Contract test: environment-aware redirect builds callback to same-origin
      File: `frontend/tests/contract/auth.env-redirect.contract.spec.ts`
- [ ] T008 [P] Integration test: sign-in flow triggers provider redirect and returns to same-origin
      File: `frontend/tests/integration/auth.flow.spec.ts`

## Phase 3.3: Core Implementation (ONLY after tests are failing)
- [ ] T009 [P] Create environment redirect util
      File: `frontend/src/utils/envRedirect.ts` (exports `getCallbackOrigin(): string`)
- [ ] T010 [P] Create auth composable wrapping Supabase
      File: `frontend/src/composables/useAuth.ts` (loginWithGoogle, logout, session)
- [ ] T011 [P] Configure Supabase module
      File: `frontend/nuxt.config.ts` (enable module, basic options, runtime config)
- [ ] T012 Create global auth middleware to guard protected routes
      File: `frontend/src/middleware/auth.global.ts` (bypass `/login`)
- [ ] T013 Create sign-in page with "Continue with Google"
      File: `frontend/src/pages/login.vue` (redirect away if already authenticated)
- [ ] T014 Add sign-out action in a shared UI location
      File: `frontend/src/components/AppSignOut.vue` and usage wiring

## Phase 3.4: Integration
- [ ] T015 Use environment-aware origin in Google OAuth sign-in
      File: `frontend/src/composables/useAuth.ts` (pass options.redirectTo = getCallbackOrigin())
- [ ] T016 Error handling for provider cancel/denial
      File: `frontend/src/pages/auth-error.vue` and flows from composable
- [ ] T017 Update Supabase dashboard redirect URLs for local/dev/prod
      Doc step: Edit settings in Supabase; record values in `specs/004-add-authentication-system/quickstart.md`

## Phase 3.5: Polish
- [ ] T018 [P] Unit tests for `envRedirect.ts`
      File: `frontend/tests/unit/envRedirect.spec.ts`
- [ ] T019 [P] Unit tests for `auth.global.ts` middleware
      File: `frontend/tests/unit/auth.middleware.spec.ts`
- [ ] T020 [P] Update `specs/004-add-authentication-system/quickstart.md` with verified URLs and commands
- [ ] T021 Manual validation per quickstart (local/dev/prod)

## Dependencies
- Setup (T001–T004) before Tests and Core
- Tests (T005–T008) before Core Implementation (T009–T014)
- T009 before T010 and T015
- T010 before T012 and T013
- T011 before running the app/tests
- Core before Integration (T015–T017)
- Everything before Polish (T018–T021)

## Parallel Example
```
# Launch contract + integration tests together once setup is ready:
Task: "T005 Contract test unauthenticated guard" → frontend/tests/contract/auth.guard.contract.spec.ts
Task: "T006 Contract test authenticated redirect" → frontend/tests/contract/auth.redirect.contract.spec.ts
Task: "T007 Contract test env redirect builder" → frontend/tests/contract/auth.env-redirect.contract.spec.ts
Task: "T008 Integration test sign-in flow" → frontend/tests/integration/auth.flow.spec.ts
```

## Validation Checklist
- [ ] All contracts have corresponding tests (see contracts/AUTH-CONTRACTS.md)
- [ ] All entities present in `data-model.md` have model/type representations if needed
- [ ] All tests come before implementation
- [ ] Parallel tasks are independent and touch different files
- [ ] Each task specifies an exact file path
