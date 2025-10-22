# Architecture Review - Training Plan Generation Feature
**Date**: 2025-10-22  
**Reviewer**: Sarah (Product Owner)  
**Story**: 1.1 - AI Training Plan Generation and Management

## Review Summary

Architecture documents have been reviewed and updated to align with Story 1.1 requirements and current project state.

## Updates Made

### 1. Tech Stack (`tech-stack.md`)
**Status**: ✅ Updated

**Changes**:
- Updated UI framework from "Element Plus" to "PrimeVue v4 (+ PrimeIcons)"
- Added "State Management: Pinia"
- Updated styling description to "PrimeVue theming + custom design tokens (rem units only)"

**Rationale**: Reflects actual migration to PrimeVue completed in previous stories.

### 2. Source Tree (`source-tree.md`)
**Status**: ✅ Updated

**Changes**:
- Updated to reflect Nuxt 4 `app/` directory structure
- Added `components/plans/` directory with plan-specific components
- Added `pages/plans/` directory for plan management
- Added `stores/plans.ts` for Pinia store
- Added `server/api/plans/` for plan API endpoints
- Added `db/schema/training-plans.ts` (to be created by developer)
- Documented existing components (layout, form, display)
- Added component documentation path

**Rationale**: Provides clear structure for developer implementing Story 1.1.

## Developer Checklist for Story 1.1

### Database Layer
- [ ] Create `db/schema/training-plans.ts` with Drizzle schema
- [ ] Export from `db/schema/index.ts`
- [ ] Generate migration with `pnpm db:generate`
- [ ] Apply migration with `pnpm db:push`
- [ ] Add RLS policies to `db/rls-policies.sql`
- [ ] Apply RLS with `pnpm db:apply-rls`

### API Layer
- [ ] Create `server/api/plans/` directory structure
- [ ] Implement plan generation endpoint(s)
- [ ] Implement plan management endpoints (list, get, update, delete)
- [ ] Add Zod validation schemas
- [ ] Implement Cloudflare Workers AI integration
- [ ] Add error handling and retry logic

### State Management
- [ ] Create `app/stores/plans.ts` Pinia store
- [ ] Implement state: plans, activePlan, loading, error
- [ ] Implement actions: fetchPlans, generatePlan, setActivePlan, deletePlan
- [ ] Implement computed properties: activePlanDetails, inactivePlans

### UI Components
- [ ] Create `app/components/plans/PlanGenerator.vue`
- [ ] Create `app/components/plans/PlanCard.vue`
- [ ] Create `app/components/plans/PlanWeekView.vue`
- [ ] Create `app/pages/plans/index.vue`
- [ ] Update `app/pages/onboarding.vue` (add plan generation step)
- [ ] Update `app/pages/index.vue` (display active plan, add management link)

### Testing
- [ ] Unit tests for Pinia store
- [ ] Unit tests for Zod schemas
- [ ] Integration tests for plan generation flow
- [ ] Manual testing per story checklist

## Architecture Alignment

### ✅ Aligned
- Database: Supabase Postgres with RLS
- ORM: Drizzle ORM for schema management
- AI: Cloudflare Workers AI integration pattern
- Validation: Zod for API response validation
- State: Pinia for shared state management
- UI: PrimeVue components with design tokens
- Styling: rem units only, design tokens from `main.css`

### ⚠️ To Be Created (Story 1.1)
- `training_plans` table schema
- Training plans RLS policies
- Plan-related API endpoints
- Plan-related Pinia store
- Plan-related UI components
- Plan management page

## Dependencies

### Required Before Implementation
- ✅ User profiles table (exists)
- ✅ Profile management (implemented)
- ✅ Supabase auth (implemented)
- ✅ PrimeVue UI framework (migrated)
- ✅ Design token system (implemented)

### Blocked By
None - Story 1.1 can proceed immediately.

### Blocks
- Story 1.2: AI Session Generation (depends on active training plan)
- Session Runner (depends on session generation)
- Feedback & Adaptation (depends on session completion)

## Notes

### High-Level Plan Structure
Training plans must remain **high-level**:
- ✅ Include: Day-to-modality mapping (e.g., "Mon: Chest", "Tue: Back+Cardio")
- ❌ Exclude: Specific exercises, sets, reps, weights

Detailed session content is generated separately via AI Session Generation (Story 1.2).

### API Design Flexibility
Story intentionally does not prescribe specific endpoint structure. Developer has flexibility to choose:
- RESTful vs RPC-style API design
- Endpoint naming and organization
- Request/response formats

Required operations: generate, list, get, update, delete

### Plan Independence
Training plan structure does NOT change based on session feedback. Only session generation adapts to feedback (load progression, exercise selection).

## Recommendations

1. **Implement Story 1.1 first** - Foundation for all training features
2. **Create Story 1.2 next** - AI Session Generation (depends on 1.1)
3. **Consider creating Epic** - Group related training features (plan, session, feedback, adaptation)
4. **Update PRD** - ✅ Already updated with plan vs session distinction

## Sign-off

**Architecture Review**: ✅ Complete  
**Ready for Development**: ✅ Yes  
**Blocking Issues**: None

---

**Next Action**: Assign Story 1.1 to @/dev for implementation
