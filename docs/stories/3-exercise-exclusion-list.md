# User Story: Exercise Exclusion List ("Do Not Suggest")

**Epic:** User Profile Enhancements (M1.4)  
**Story Type:** Brownfield Enhancement  
**Estimated Effort:** 6-8 hours  
**Priority:** High  
**Status:** Ready for Development  
**Sequence:** 3 of 3 (Profile Personalization Series)

---

## User Story

**As a** gym user who cannot perform certain exercises,  
**I want** to mark exercises as "unavailable" or "do not suggest" from the session preview,  
**So that** the AI never includes them in my future generated sessions.

---

## Story Context

### Current State

- Session preview shows exercises with "Swap" button
- No way to permanently exclude an exercise
- Users must swap the same exercise repeatedly across sessions
- AI has no knowledge of user's exercise restrictions (beyond injury flags)

### Target State

- "Can't do this" button on each exercise in session preview
- Exercise added to user's exclusion list when clicked
- Exclusion list manageable from profile settings
- AI prompts include exclusion list to avoid those exercises
- Reduced friction in future session generation

### User Value

- **Efficiency**: Mark once, never see again
- **Personalization**: System learns what doesn't work for user
- **Better Sessions**: AI avoids exercises user can't perform
- **Control**: Easy to manage exclusions from profile

---

## Acceptance Criteria

### Functional Requirements

#### 1. Database Schema

- [ ] Add `excluded_exercises` JSONB column to `profiles` table
- [ ] Type: array of strings (exercise names)
- [ ] Default: empty array `[]`
- [ ] Create database migration

#### 2. Session Preview - Mark Unavailable

- [ ] Add "Can't do this" button/icon on each exercise card
- [ ] Button positioned alongside existing "Swap" button
- [ ] Clicking opens confirmation dialog
- [ ] Dialog text: "Add [Exercise Name] to your exclusion list? It won't appear in future sessions."
- [ ] Confirm adds exercise to exclusion list
- [ ] Success toast: "[Exercise Name] added to exclusion list"
- [ ] After adding, offer to swap the exercise (optional flow)

#### 3. Profile Settings - Manage Exclusions

- [ ] New section in profile edit page: "Excluded Exercises"
- [ ] Display list of excluded exercise names
- [ ] Each item has "Remove" button (X icon)
- [ ] Removing shows confirmation
- [ ] Empty state: "No excluded exercises. Mark exercises as unavailable from the session preview."
- [ ] Optional: Manual text input to add exercises

#### 4. AI Prompt Integration

- [ ] Include exclusion list in all AI prompts that generate exercises
- [ ] Format: "EXCLUDED EXERCISES (never include these): [list]"
- [ ] Apply to:
  - Training plan generation
  - Session generation
  - Exercise swap generation
- [ ] Case-insensitive matching (AI handles this naturally)

---

## Technical Implementation

### Database Migration

```sql
-- Add excluded_exercises column to profiles table
ALTER TABLE profiles
ADD COLUMN excluded_exercises JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Create index for potential future queries
CREATE INDEX idx_profiles_excluded_exercises ON profiles USING gin(excluded_exercises);
```

### Schema Update

```typescript
// db/schema/profiles.ts
export const profiles = pgTable('profiles', {
  // ... existing fields
  excludedExercises: jsonb('excluded_exercises').$type<string[]>().notNull().default([]),
  // ... rest of fields
})
```

### Store Interface Update

```typescript
// app/stores/profile.store.ts
export interface ProfileFormData {
  excludedExercises?: string[]
  // ... existing fields
}

// New actions
const addExcludedExercise = async (exerciseName: string) => {
  if (!profile.value) return

  const normalized = exerciseName.trim()
  const current = profile.value.excludedExercises || []

  // Check if already excluded (case-insensitive)
  if (current.some((e) => e.toLowerCase() === normalized.toLowerCase())) {
    return // Already excluded
  }

  const updated = [...current, normalized]

  try {
    await $fetch('/api/profile/exclude-exercise', {
      method: 'POST',
      body: { exerciseName: normalized },
    })

    profile.value.excludedExercises = updated
    return true
  } catch (err) {
    throw err
  }
}

const removeExcludedExercise = async (exerciseName: string) => {
  if (!profile.value) return

  const normalized = exerciseName.trim().toLowerCase()
  const current = profile.value.excludedExercises || []
  const updated = current.filter((e) => e.toLowerCase() !== normalized)

  try {
    await $fetch('/api/profile/exclude-exercise', {
      method: 'DELETE',
      body: { exerciseName },
    })

    profile.value.excludedExercises = updated
    return true
  } catch (err) {
    throw err
  }
}
```

### API Endpoints

```typescript
// server/api/profile/exclude-exercise.post.ts
import { defineEventHandler, readBody, createError } from 'h3'
import { serverSupabaseUser } from '#supabase/server'
import { profiles } from '../../../db/schema'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

const ExcludeExerciseSchema = z.object({
  exerciseName: z.string().min(1).max(200),
})

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const body = await readBody(event)
  const validation = ExcludeExerciseSchema.safeParse(body)

  if (!validation.success) {
    throw createError({ statusCode: 400, message: 'Invalid exercise name' })
  }

  const { exerciseName } = validation.data
  const connectionString = process.env.DATABASE_URL
  const client = postgres(connectionString!)
  const db = drizzle(client)

  try {
    // Get current profile
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, user.sub)).limit(1)

    if (!profile) {
      throw createError({ statusCode: 404, message: 'Profile not found' })
    }

    const current = (profile.excludedExercises as string[]) || []

    // Check if already excluded (case-insensitive)
    if (current.some((e) => e.toLowerCase() === exerciseName.toLowerCase())) {
      return { success: true, message: 'Already excluded' }
    }

    const updated = [...current, exerciseName]

    await db
      .update(profiles)
      .set({
        excludedExercises: updated,
        updatedAt: new Date(),
      })
      .where(eq(profiles.userId, user.sub))

    return { success: true, excludedExercises: updated }
  } finally {
    await client.end()
  }
})
```

```typescript
// server/api/profile/exclude-exercise.delete.ts
// Similar structure, but removes from array instead of adding
```

### AI Prompt Update

```typescript
// server/shared/prompts/plans.ts

export function getExcludedExercisesContext(excludedExercises: string[]): string {
  if (!excludedExercises || excludedExercises.length === 0) {
    return ''
  }

  return `
EXCLUDED EXERCISES (NEVER include these - user cannot perform them):
${excludedExercises.map((e) => `- ${e}`).join('\n')}

Important: Do not include any exercise from the excluded list above, regardless of how relevant it might seem. Choose alternative exercises instead.`
}

export function getTrainingPlanUserPrompt(input: PlanGenerationInput): string {
  const { profile } = input

  const excludedContext = getExcludedExercisesContext((profile.excludedExercises as string[]) || [])

  return `Create a personalized training plan with the following parameters:

USER PROFILE:
// ... existing profile context

${excludedContext}

REQUIREMENTS:
// ... rest of prompt
`
}
```

### Exercise Swap Integration

```typescript
// server/api/sessions/[id]/swap-exercise.post.ts
// Update to include excluded exercises in constraints

const newExerciseData = await $fetch<{ exercises: any[] }>('/api/ai/session.generate', {
  method: 'POST',
  headers: getRequestHeaders(event) as HeadersInit,
  body: {
    modality: currentExercise.type,
    sessionLengthMin: 10,
    constraints: {
      exerciseCount: 1,
      excludeExercises: [
        ...exercises.map((e) => e.name), // Avoid duplicates in session
        ...(profile.excludedExercises || []), // User's permanent exclusions
      ],
    },
  },
})
```

---

## UI/UX Design

### Session Preview - Exercise Card with Exclusion Button

```
┌─────────────────────────────────────────┐
│  ┌───┐                                  │
│  │ 1 │  BENCH PRESS           [🔄] [🚫] │  <- Swap and Exclude buttons
│  └───┘                                  │
├─────────────────────────────────────────┤
│  Sets: 4    Reps: 8-10    Load: 60kg   │
│  Rest: 90s  RIR: 2                      │
└─────────────────────────────────────────┘

🔄 = Swap exercise (existing)
🚫 = Can't do this / Exclude (new)
```

### Exclusion Confirmation Dialog

```
┌─────────────────────────────────────────┐
│                                         │
│         🚫 Exclude Exercise?            │
│                                         │
│  Add "Bench Press" to your exclusion    │
│  list? It won't appear in future        │
│  sessions.                              │
│                                         │
│  ┌─────────────┐  ┌─────────────────┐  │
│  │   Cancel    │  │ Yes, Exclude    │  │
│  └─────────────┘  └─────────────────┘  │
│                                         │
└─────────────────────────────────────────┘
```

### Post-Exclusion Toast with Swap Option

```
┌─────────────────────────────────────────┐
│ ✓ "Bench Press" added to exclusion list │
│                                         │
│   [Swap Now]  [Dismiss]                 │
└─────────────────────────────────────────┘
```

### Profile Edit - Excluded Exercises Section

```
┌─────────────────────────────────────────┐
│  🚫 Excluded Exercises                  │
├─────────────────────────────────────────┤
│                                         │
│  These exercises won't appear in        │
│  your generated sessions.               │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Bench Press                 [✕] │   │
│  ├─────────────────────────────────┤   │
│  │ Lat Pulldown               [✕] │   │
│  ├─────────────────────────────────┤   │
│  │ Leg Press                  [✕] │   │
│  └─────────────────────────────────┘   │
│                                         │
│  3 exercises excluded                   │
│                                         │
└─────────────────────────────────────────┘
```

### Profile Edit - Empty State

```
┌─────────────────────────────────────────┐
│  🚫 Excluded Exercises                  │
├─────────────────────────────────────────┤
│                                         │
│         No excluded exercises           │
│                                         │
│  Mark exercises as unavailable from     │
│  the session preview to add them here.  │
│                                         │
└─────────────────────────────────────────┘
```

---

## Tasks

### Phase 1: Data Layer (1-1.5 hours)

- [ ] Create migration file in `db/migrations/`
- [ ] Update `db/schema/profiles.ts` with excludedExercises field
- [ ] Run migration locally
- [ ] Verify column exists in database

### Phase 2: API Endpoints (1-1.5 hours)

- [ ] Create `server/api/profile/exclude-exercise.post.ts`
- [ ] Create `server/api/profile/exclude-exercise.delete.ts`
- [ ] Add validation and error handling
- [ ] Test endpoints with Postman/curl

### Phase 3: Store Updates (30-45 min)

- [ ] Add `excludedExercises` to ProfileFormData interface
- [ ] Add `addExcludedExercise()` action
- [ ] Add `removeExcludedExercise()` action
- [ ] Update profile fetch to include excludedExercises

### Phase 4: Session Preview UI (1.5-2 hours)

- [ ] Add "Can't do this" button to exercise cards in `preview.vue`
- [ ] Create confirmation dialog component
- [ ] Wire up exclusion action to API
- [ ] Add success toast with optional swap trigger
- [ ] Handle loading/error states

### Phase 5: Profile Edit UI (1.5-2 hours)

- [ ] Create `ProfileFormExcludedExercises.vue` component
- [ ] Add to `ProfileEditForm.vue`
- [ ] Display list with remove buttons
- [ ] Add confirmation for removal
- [ ] Empty state design
- [ ] Optional: Add manual input field

### Phase 6: AI Integration (45-60 min)

- [ ] Create `getExcludedExercisesContext()` helper
- [ ] Update `getTrainingPlanUserPrompt()` in `plans.ts`
- [ ] Update `getRehabPlanUserPrompt()` in `plans.ts`
- [ ] Update session generation prompts
- [ ] Update exercise swap to include exclusions in constraints

### Phase 7: Testing & Polish (30-45 min)

- [ ] Test full flow: exclude → verify not in next session
- [ ] Test removal flow
- [ ] Test edge cases (empty list, many exclusions)
- [ ] Verify case-insensitive handling

---

## Files to Create

| File                                                      | Purpose                             |
| --------------------------------------------------------- | ----------------------------------- |
| `db/migrations/XXXX_add_excluded_exercises.sql`           | New migration file                  |
| `server/api/profile/exclude-exercise.post.ts`             | Add exercise to exclusion list      |
| `server/api/profile/exclude-exercise.delete.ts`           | Remove exercise from exclusion list |
| `app/components/profile/ProfileFormExcludedExercises.vue` | Exclusion list management UI        |

## Files to Modify

| File                                             | Change                                 |
| ------------------------------------------------ | -------------------------------------- |
| `db/schema/profiles.ts`                          | Add excludedExercises column           |
| `app/stores/profile.store.ts`                    | Add exclusion actions                  |
| `app/pages/session/preview.vue`                  | Add exclude button and dialog          |
| `app/components/profile/ProfileEditForm.vue`     | Include exclusion section              |
| `server/shared/prompts/plans.ts`                 | Add exclusion context to AI prompts    |
| `server/api/sessions/[id]/swap-exercise.post.ts` | Include exclusions in swap constraints |

---

## Definition of Done

- [ ] Excluded exercises column exists in database
- [ ] Migration runs successfully
- [ ] User can exclude exercise from session preview
- [ ] Confirmation dialog shown before excluding
- [ ] Success toast displayed after excluding
- [ ] Excluded exercises visible in profile edit
- [ ] User can remove exclusions from profile
- [ ] AI prompts include exclusion list
- [ ] Exercise swap respects exclusions
- [ ] Excluded exercises don't appear in new sessions
- [ ] No console errors
- [ ] Case-insensitive matching works

---

## Edge Cases to Handle

1. **Duplicate Exclusions**: Prevent adding same exercise twice (case-insensitive)
2. **Empty Exercise Name**: Validate non-empty string
3. **Very Long Lists**: Consider pagination if list exceeds ~50 items (future)
4. **Exercise Name Variations**: AI should understand "Bench Press" = "bench press" = "Barbell Bench Press"
5. **Profile Not Found**: Handle gracefully in API
6. **Concurrent Modifications**: Last write wins (acceptable for this use case)

---

## Future Enhancements (Out of Scope)

- Exercise database with IDs for exact matching
- Reason for exclusion (injury, equipment, preference)
- Temporary exclusions (exclude for X weeks)
- Exercise categories (exclude all "push" exercises)
- Import/export exclusion list
- Share exclusion list between profiles

---

## Notes

- Case-insensitive comparison handled by AI (natural language understanding)
- If exact matching becomes problematic, consider exercise ID system later
- Exclusion list applies to all session types (strength, cardio, etc.)
- Users should use this for permanent exclusions, not temporary preferences
- Consider warning if exclusion list gets very long (>20 items)

---

## Dependencies

- **Story 1**: Gender field (completed first)
- **Story 2**: Gym setup (completed first)
- This story builds on the profile infrastructure from Stories 1 & 2

---

**Created:** 2025-11-30  
**Author:** Mary (Business Analyst)
