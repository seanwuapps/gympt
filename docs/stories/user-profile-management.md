# Story: User Profile Management - Create, View, and Edit Profile

## User Story

As a **signed-in user**,
I want to **create and manage my training profile with preferences**,
So that **the AI can generate personalized training sessions based on my goals, experience, and equipment**.

## Story Context

**Existing System Integration:**

- Integrates with: Supabase Auth (Google OAuth already working)
- Technology: Nuxt 4, Drizzle ORM, Supabase Postgres, Element Plus UI
- Follows pattern: Server API routes with RLS, composables for data access
- Touch points: Auth middleware, Supabase user session, database with RLS

**Reference:**

- PRD Section 4: Functional Requirements - Onboarding
- Architecture Section 4: Data Model - `profiles` table
- Architecture Section 5: Security & RLS

## Acceptance Criteria

### Functional Requirements

1. **Automatic Onboarding Redirect**
   - When a signed-in user does not have a profile, they are automatically redirected to `/onboarding`
   - This redirect happens on any protected route (index, profile, etc.)
   - User cannot access other pages until profile is created
   - After profile creation, user is redirected to home page

2. **Profile Creation (First-Time User) - Multi-Step Wizard**
   - After Google sign-in, new users are redirected to onboarding wizard
   - **Step 1 (Required):** Experience level + Preferred training days
     - Experience level: Radio buttons (beginner, intermediate, advanced)
     - Preferred training days: Checkbox buttons (Mon-Sun, minimum 1 required)
     - Cannot proceed without completing both fields
   - **Step 2 (Optional):** Goals + Progression aggressiveness
     - Goals: Textarea (max 500 chars, optional)
     - Aggressiveness: Dropdown (conservative, moderate, aggressive) with default "moderate"
     - Can skip this step
   - **Step 3 (Optional):** Injury flags
     - Injury flags: Textarea (max 300 chars, optional)
     - Can skip this step
   - Progress indicator shows current step (1 of 3, 2 of 3, 3 of 3)
   - Can navigate back to previous steps
   - Units default to metric (kg/cm)
   - Language defaults to English
   - Equipment assumption: Commercial gym (full equipment access)
   - Profile is saved to database on "Complete Setup" with user_id from auth.uid()
   - Progress saved to localStorage (can resume if interrupted)

3. **Profile View**
   - Authenticated users with existing profile can view their profile at `/profile`
   - Displays all profile fields in read-only format
   - Shows "Edit Profile" button

4. **Profile Edit**
   - Users can click "Edit Profile" to enter edit mode
   - All fields are editable except user_id
   - "Save" button persists changes
   - "Cancel" button discards changes and returns to view mode
   - Success message shown after save

### Integration Requirements

5. **Existing auth flow continues to work unchanged**
   - Google OAuth sign-in/sign-out unaffected
   - Session state via Supabase composables works as before
   - Auth middleware protects profile routes

6. **New functionality follows existing server API pattern**
   - Server routes in `server/api/profile/`
   - Zod validation for inputs/outputs
   - RLS enforces user can only access own profile

7. **Integration with Supabase maintains current behavior**
   - Uses existing Supabase client
   - Respects RLS policies
   - Leverages auth.uid() for user identification

8. **Profile check middleware**
   - Create middleware to check if user has profile
   - Redirect to `/onboarding` if profile doesn't exist
   - Allow access to `/onboarding` and auth routes without profile
   - Run after auth middleware

### Quality Requirements

9. **Change is covered by appropriate tests**
   - Manual testing: Create, view, edit profile flows
   - Verify RLS: User A cannot access User B's profile
   - Test automatic redirect when profile doesn't exist
   - Test that user can access app after profile creation

10. **Documentation is updated**
    - Update `docs/SETUP.md` if new setup steps required
    - Add profile feature to README if applicable

11. **No regression in existing functionality verified**
    - Auth flow still works
    - Existing pages (index, login, confirm) unaffected
    - Users with existing profiles can access all pages normally

## Technical Implementation

### Database Schema

**File:** `db/schema/profiles.ts`

```typescript
import { pgTable, uuid, text, timestamp, integer, jsonb } from 'drizzle-orm/pg-core'

export const profiles = pgTable('profiles', {
  userId: uuid('user_id')
    .primaryKey()
    .references(() => auth.users.id, { onDelete: 'cascade' }),
  goals: text('goals'),
  experienceLevel: text('experience_level').notNull().default('beginner'), // 'beginner' | 'intermediate' | 'advanced'
  preferredTrainingDays: jsonb('preferred_training_days').notNull().default('["Mon","Wed","Fri"]'), // Array of day abbreviations: 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'
  injuryFlags: text('injury_flags'),
  units: text('units').notNull().default('metric'), // 'metric' | 'imperial'
  language: text('language').notNull().default('en'),
  aggressiveness: text('aggressiveness').notNull().default('moderate'), // 'conservative' | 'moderate' | 'aggressive'
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
```

### Server API Routes

**1. GET `/api/profile`**

- Fetches current user's profile using auth.uid()
- Returns 404 if profile doesn't exist
- Returns profile object if found

**2. POST `/api/profile`**

- Creates or updates profile (upsert)
- Validates input with Zod schema
- Uses auth.uid() to ensure user only modifies own profile
- Returns updated profile

**Zod Schema:**

```typescript
const profileSchema = z.object({
  goals: z.string().optional(),
  experienceLevel: z.enum(['beginner', 'intermediate', 'advanced']),
  preferredTrainingDays: z
    .array(z.enum(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']))
    .min(1)
    .max(7), // Array of day abbreviations, at least 1 day
  injuryFlags: z.string().optional(),
  units: z.enum(['metric', 'imperial']).default('metric'),
  language: z.string().default('en'),
  aggressiveness: z.enum(['conservative', 'moderate', 'aggressive']).default('moderate'),
})
```

### Middleware

**File:** `app/middleware/profile-check.global.ts`

```typescript
// Global middleware to check if user has profile
// Runs after auth middleware
export default defineNuxtRouteMiddleware(async (to) => {
  const user = useSupabaseUser()
  
  // Skip check for auth routes and onboarding
  const publicRoutes = ['/login', '/confirm', '/onboarding']
  if (publicRoutes.includes(to.path)) {
    return
  }
  
  // Only check if user is authenticated
  if (user.value) {
    try {
      const profile = await $fetch('/api/profile')
      // Profile exists, allow access
    } catch (error: any) {
      if (error.statusCode === 404) {
        // No profile, redirect to onboarding
        return navigateTo('/onboarding')
      }
    }
  }
})
```

### Frontend Components

**1. Page: `app/pages/onboarding.vue`** (Multi-step wizard)

- Protected by auth middleware only (not profile-check)
- Three-step wizard using `el-steps` component
- State management:
  - Current step index (0, 1, 2)
  - Form data object with all fields
  - Validation state per step
  - Progress saved to localStorage
- Step navigation:
  - Next/Back buttons
  - Click on progress indicator to jump to completed steps
  - Swipe gestures on mobile (optional enhancement)
- Redirects to home/dashboard after completion

**2. Components: `app/components/onboarding/`**

- `OnboardingStep1.vue` - Experience & Schedule
  - Radio button group for experience level
  - Checkbox button group for training days
  - Validation: both fields required
- `OnboardingStep2.vue` - Goals & Progression
  - Textarea for goals (500 char limit)
  - Select dropdown for aggressiveness
  - All fields optional
- `OnboardingStep3.vue` - Safety
  - Textarea for injury flags (300 char limit)
  - Warning icon and help text
  - Optional field

**3. Page: `app/pages/profile.vue`** (View/Edit existing profile)

- Protected by auth middleware
- Fetches profile on mount
- Toggle between view and edit modes
- Edit mode: Single-page form (not wizard) with all fields
- Uses Element Plus form components

**4. Composable: `app/composables/useProfile.ts`**

```typescript
export const useProfile = () => {
  const profile = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const fetchProfile = async () => {
    /* ... */
  }
  const saveProfile = async (data) => {
    /* ... */
  }

  // Wizard-specific
  const saveProgressToLocalStorage = (step, data) => {
    /* ... */
  }
  const loadProgressFromLocalStorage = () => {
    /* ... */
  }
  const clearProgress = () => {
    /* ... */
  }

  return {
    profile,
    loading,
    error,
    fetchProfile,
    saveProfile,
    saveProgressToLocalStorage,
    loadProgressFromLocalStorage,
    clearProgress,
  }
}
```

### RLS Policies (Supabase Dashboard)

```sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

## Tasks

- [x] **Database Layer**
  - [x] Create `db/schema/profiles.ts` with Drizzle schema
  - [x] Generate migration: `pnpm db:generate`
  - [x] Push to Supabase: `pnpm db:push`
  - [x] Configure RLS policies via migration script (`pnpm db:apply-rls`)
  - [ ] Test RLS with multiple users

- [x] **Server API**
  - [x] Create `server/api/profile.get.ts`
  - [x] Create `server/api/profile.post.ts`
  - [x] Add Zod validation schemas
  - [ ] Test endpoints with Postman/curl

- [x] **Frontend**
  - [x] Create `app/composables/useProfile.ts` with wizard helpers
  - [x] Create `app/pages/onboarding.vue` (multi-step wizard)
  - [x] Create `app/components/onboarding/OnboardingStep1.vue`
  - [x] Create `app/components/onboarding/OnboardingStep2.vue`
  - [x] Create `app/components/onboarding/OnboardingStep3.vue`
  - [x] Create `app/pages/profile.vue` (view/edit mode, single-page form)
  - [x] Add profile link to navigation
  - [x] Implement localStorage progress saving
  - [ ] Create `app/middleware/profile-check.global.ts` for automatic redirect
  - [ ] Test wizard flow (next, back, skip, resume)
  - [ ] Test view/edit profile flows
  - [ ] Test automatic redirect when no profile exists

- [ ] **Integration & Testing**
  - [ ] Verify auth middleware protects routes
  - [ ] Test with multiple Google accounts
  - [ ] Verify RLS prevents cross-user access
  - [ ] Verify existing auth flow unaffected

- [ ] **Documentation**
  - [ ] Update `docs/SETUP.md` if needed
  - [ ] Update README with profile feature

## Definition of Done

- [ ] Signed-in users without profile are automatically redirected to `/onboarding`
- [ ] Users cannot access other pages until profile is created
- [ ] New users can create profile via 3-step wizard
- [ ] After profile creation, users are redirected to home page
- [ ] Users with existing profile can view their profile at `/profile`
- [ ] Users can edit and save profile changes
- [ ] RLS enforces data isolation (tested with 2+ users)
- [ ] Server API validates inputs with Zod
- [ ] Existing auth flow works unchanged
- [ ] Code follows existing patterns (server routes, composables, RLS, middleware)
- [ ] No console errors or warnings
- [ ] Profile data persists across sessions

## Risk and Compatibility Check

**Primary Risk:** RLS misconfiguration could allow users to access other users' profiles

**Mitigation:**

- Test RLS policies with multiple accounts before deploying
- Use `auth.uid()` consistently in all queries
- Never expose service role key to client

**Rollback:**

- Drop `profiles` table if critical issues found
- Remove profile routes from `server/api/`
- Remove profile pages from `app/pages/`
- Revert migration with Drizzle

**Compatibility Verification:**

- [x] No breaking changes to existing APIs (new endpoints only)
- [x] Database changes are additive only (new table)
- [x] UI changes follow existing design patterns (Element Plus)
- [x] Performance impact is negligible (single table, indexed by PK)

## Dev Notes

**Integration Approach:**

- Follows existing pattern: Drizzle schema → migration → RLS → server API → composable → page
- Reuses Supabase client from `@nuxtjs/supabase`
- Uses `useSupabaseUser()` to get current user

**Existing Pattern Reference:**

- Server API: See `server/api/ai/session.generate.post.ts` for Zod validation pattern
- Auth middleware: See `app/middleware/auth.ts`
- Composables: Follow Vue 3 Composition API patterns

**Key Constraints:**

- Must use RLS for all data access
- Profile must be created before user can generate sessions (future feature dependency)
- Units and language are MVP-locked to metric/English (editable but not used yet)
- Equipment assumption: Commercial gym with full equipment (no user selection needed for MVP)

**UX Notes - Multi-Step Wizard:**

**Step 1: Experience & Schedule** (Required)

- Title: "Let's get started!"
- Experience level: Radio buttons with icons and descriptions
  - Beginner: "New to training"
  - Intermediate: "6+ months experience"
  - Advanced: "2+ years experience"
- Preferred training days: Checkbox buttons in circular layout (M T W T F S S)
  - Single letter display on mobile
  - Minimum 1 day required
  - Default: Mon, Wed, Fri pre-selected
- Primary action: "Next" button (bottom right)

**Step 2: Goals & Progression** (Optional but recommended)

- Title: "Personalize your training"
- Goals: Textarea with placeholder "e.g., Build strength for hiking, lose 10kg..."
  - Max 500 characters with counter
  - Optional field
- Progression aggressiveness: Select dropdown with descriptions
  - Conservative: "Slower, safer progression"
  - Moderate: "Balanced approach (recommended)" ← default
  - Aggressive: "Faster progression, more challenge"
- Primary action: "Next" button
- Secondary action: "Back" button (top left)

**Step 3: Safety & Finish** (Optional)

- Title: "Any injuries or limitations?"
- Injury flags: Textarea with warning icon
  - Placeholder: "e.g., Lower back pain, right knee issues..."
  - Max 300 characters with counter
  - Help text: "This helps the AI avoid exercises that may aggravate your condition"
  - Optional field
- Primary action: "Complete Setup" button (prominent, bottom)
- Secondary action: "Back" button (top left)
- Tertiary action: "Skip" link (if field is empty)

**Progress Indicator:**

- Use `el-steps` component at top
- Show: "1 of 3", "2 of 3", "3 of 3"
- Visual progress bar
- All steps accessible via clicking (if previous steps valid)

**Mobile Optimizations:**

- One question per screen (reduces cognitive load)
- Large tap targets (2.75rem minimum)
- Primary button fixed to bottom (thumb zone)
- Smooth transitions between steps
- Auto-focus first field on each step
- Swipe gestures: swipe left = next, swipe right = back

**Validation:**

- Step 1: Must select experience level + at least 1 training day
- Step 2 & 3: All fields optional, can skip
- Inline validation on blur
- Prevent "Next" if required fields invalid

**State Management:**

- Save progress to localStorage (in case user closes browser)
- Show "Resume setup" if incomplete profile found
- Can edit any step by clicking progress indicator

## QA Hooks

- Run `@qa *risk {this-story}` to identify additional risks
- Run `@qa *design {this-story}` to outline test strategy
- After implementation, run `@qa *review {this-story}` and then `@qa *gate {this-story}`

---

## Dev Agent Record

### File List
- `db/schema/profiles.ts` - Profile table schema
- `db/schema/index.ts` - Schema exports
- `db/migrations/0000_aspiring_invisible_woman.sql` - Initial migration
- `db/rls-policies.sql` - RLS policies (to be applied manually)
- `server/api/profile.get.ts` - GET profile endpoint
- `server/api/profile.post.ts` - POST profile endpoint (upsert)
- `app/composables/useProfile.ts` - Profile composable with wizard helpers
- `app/components/onboarding/OnboardingStep1.vue` - Step 1: Experience & Schedule
- `app/components/onboarding/OnboardingStep2.vue` - Step 2: Goals & Progression
- `app/components/onboarding/OnboardingStep3.vue` - Step 3: Safety
- `app/pages/onboarding.vue` - Multi-step wizard page
- `app/pages/profile.vue` - Profile view/edit page
- `app/pages/index.vue` - Updated with profile link

### Completion Notes
- Database schema created and migrated successfully
- Server API implemented with Zod validation
- 3-step onboarding wizard with localStorage progress saving
- Profile view/edit page with Element Plus components
- All TypeScript types properly defined
- Mobile-first responsive design implemented
- **RLS policies applied automatically via migration script**

### Change Log
- 2025-10-11: Initial implementation of user profile management feature
  - Created profiles table with Drizzle ORM
  - Implemented GET/POST API endpoints with RLS
  - Built 3-step onboarding wizard
  - Created profile view/edit page
  - Added navigation link to profile
  - Created automated RLS migration script (`pnpm db:apply-rls`)
  - Applied RLS policies successfully

### Next Steps
- **NEW REQUIREMENT:** Create profile-check middleware for automatic onboarding redirect
- Test onboarding wizard flow
- Test automatic redirect when no profile exists
- Test profile view/edit functionality
- Verify RLS with multiple user accounts
- Test API endpoints

---

**Story Status:** In Progress (middleware implementation needed)
**Estimated Effort:** 4-6 hours
**Priority:** High (blocks session generation feature)
**Dependencies:** Auth (complete), Drizzle setup (complete)
