# User Story: Profile Gender Field

**Epic:** User Profile Enhancements (M1.4)  
**Story Type:** Brownfield Enhancement  
**Estimated Effort:** 2-3 hours  
**Priority:** Medium  
**Status:** Ready for Development  
**Sequence:** 1 of 3 (Profile Personalization Series)

---

## User Story

**As a** gym user setting up my profile,  
**I want** to specify my gender (male/female/other),  
**So that** the AI can generate more personalized training plans that consider physiological differences where relevant.

---

## Story Context

### Current State

- Profile schema has: goals, experienceLevel, preferredTrainingDays, injuryFlags, units, language, aggressiveness
- No gender field exists
- AI prompts do not consider gender-specific training adaptations
- Onboarding Step 1 collects "Basics" (experience level, training days)

### Target State

- Gender field added to profile (required)
- Gender selection in onboarding and profile edit
- AI prompts include gender context for male/female
- "Other" option excludes gender from AI considerations (neutral programming)

### User Value

- **Personalization**: Training plans can account for physiological differences
- **Inclusivity**: "Other" option respects user preferences without assumptions
- **Better Results**: More tailored recommendations for strength, recovery, etc.

---

## Acceptance Criteria

### Functional Requirements

#### 1. Database Schema

- [ ] Add `gender` column to `profiles` table
- [ ] Type: text enum with values `'male'`, `'female'`, `'other'`
- [ ] Column is NOT NULL (required field)
- [ ] Create database migration

#### 2. Onboarding Integration

- [ ] Add gender dropdown to Onboarding Step 1 (Basics)
- [ ] Field is required - cannot proceed without selection
- [ ] Options: Male, Female, Other
- [ ] Position after experience level selection

#### 3. Profile Edit Integration

- [ ] Add gender dropdown to Profile Edit form
- [ ] Display in "Training Preferences" section
- [ ] Pre-populate with current value

#### 4. Profile View Integration

- [ ] Display gender in profile view page
- [ ] Label: "Gender"

#### 5. AI Prompt Integration

- [ ] Include gender in `getTrainingPlanUserPrompt()` when male or female
- [ ] Include gender in `getRehabPlanUserPrompt()` when male or female
- [ ] Exclude gender context when value is "other"
- [ ] AI context: Consider recovery rates, strength baselines, hormonal factors

---

## Technical Implementation

### Database Migration

```sql
-- Add gender column to profiles table
ALTER TABLE profiles
ADD COLUMN gender TEXT NOT NULL DEFAULT 'other'
CHECK (gender IN ('male', 'female', 'other'));

-- Remove default after migration (for new profiles, it will be required via app)
-- Or keep default as 'other' for backward compatibility with existing profiles
```

### Schema Update

```typescript
// db/schema/profiles.ts
export const profiles = pgTable('profiles', {
  // ... existing fields
  gender: text('gender', {
    enum: ['male', 'female', 'other'],
  })
    .notNull()
    .default('other'),
  // ... rest of fields
})
```

### Store Interface Update

```typescript
// app/stores/profile.store.ts
export interface ProfileFormData {
  gender: 'male' | 'female' | 'other'
  // ... existing fields
}
```

### UI Options

```typescript
const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other / Prefer not to say' },
]
```

### AI Prompt Update

```typescript
// server/shared/prompts/plans.ts
export function getTrainingPlanUserPrompt(input: PlanGenerationInput): string {
  const { profile } = input

  // Only include gender context if male or female
  const genderContext =
    profile.gender !== 'other'
      ? `- Gender: ${profile.gender} (consider physiological factors like recovery rates, baseline strength, hormonal influences)`
      : ''

  return `Create a personalized training plan with the following parameters:

USER PROFILE:
${genderContext}
- Goals: ${goals}
// ... rest of prompt
`
}
```

---

## UI/UX Design

### Onboarding Step 1 Layout

```
┌─────────────────────────────────┐
│         STEP 1: BASICS          │
├─────────────────────────────────┤
│                                 │
│  Experience Level *             │
│  ┌─────────────────────────┐   │
│  │ Beginner            ▼   │   │
│  └─────────────────────────┘   │
│                                 │
│  Gender *                       │
│  ┌─────────────────────────┐   │
│  │ Select...           ▼   │   │
│  └─────────────────────────┘   │
│  Helps personalize your plan   │
│                                 │
│  Preferred Training Days *      │
│  ┌─────────────────────────┐   │
│  │ ☐ Mon ☐ Tue ☐ Wed ...   │   │
│  └─────────────────────────┘   │
│                                 │
└─────────────────────────────────┘
```

### Profile Edit Section

```
┌─────────────────────────────────┐
│  🏋️ Training Preferences        │
├─────────────────────────────────┤
│                                 │
│  Experience Level               │
│  [Beginner ▼]                   │
│                                 │
│  Gender                         │
│  [Male ▼]                       │
│                                 │
│  Preferred Training Days        │
│  [Mon, Wed, Fri]                │
│                                 │
│  Progression Pace               │
│  [Moderate ▼]                   │
│                                 │
└─────────────────────────────────┘
```

---

## Tasks

### Phase 1: Data Layer (30-45 min)

- [ ] Create migration file in `db/migrations/`
- [ ] Update `db/schema/profiles.ts` with gender field
- [ ] Run migration locally
- [ ] Verify column exists in database

### Phase 2: Store & Types (15-20 min)

- [ ] Update `ProfileFormData` interface in `profile.store.ts`
- [ ] Update API payload handling in `saveProfile()`

### Phase 3: Onboarding UI (30-45 min)

- [ ] Add gender dropdown to `OnboardingStep1.vue`
- [ ] Add validation (required field)
- [ ] Update `canProceedStep1` computed property
- [ ] Update onboarding store if needed

### Phase 4: Profile Edit UI (20-30 min)

- [ ] Add gender dropdown to `ProfileFormTrainingPreferences.vue`
- [ ] Ensure pre-population from existing profile
- [ ] Test save functionality

### Phase 5: Profile View (10-15 min)

- [ ] Add gender display to profile details in `/profile/index.vue`

### Phase 6: AI Integration (20-30 min)

- [ ] Update `getTrainingPlanUserPrompt()` in `plans.ts`
- [ ] Update `getRehabPlanUserPrompt()` in `plans.ts`
- [ ] Conditionally include gender (exclude when "other")

---

## Files to Modify

| File                                                        | Change                           |
| ----------------------------------------------------------- | -------------------------------- |
| `db/migrations/XXXX_add_gender.sql`                         | New migration file               |
| `db/schema/profiles.ts`                                     | Add gender column                |
| `app/stores/profile.store.ts`                               | Update ProfileFormData interface |
| `app/stores/onboarding.ts`                                  | Add gender to form data          |
| `app/components/onboarding/OnboardingStep1.vue`             | Add gender dropdown              |
| `app/components/profile/ProfileFormTrainingPreferences.vue` | Add gender dropdown              |
| `app/pages/profile/index.vue`                               | Display gender in view           |
| `server/shared/prompts/plans.ts`                            | Include gender in AI prompts     |

---

## Definition of Done

- [ ] Gender field exists in database
- [ ] Migration runs successfully
- [ ] Gender is required in onboarding (cannot skip)
- [ ] Gender displays in profile view
- [ ] Gender is editable in profile edit
- [ ] AI prompts include gender for male/female
- [ ] AI prompts exclude gender for "other"
- [ ] No console errors
- [ ] Existing profiles default to "other"

---

## Out of Scope

- Age or weight fields (future consideration)
- Detailed body composition data
- Gender-specific exercise recommendations (AI handles this contextually)

---

## Notes

- Default value of "other" ensures backward compatibility with existing profiles
- Users can change gender at any time via profile edit
- AI should use gender as a soft factor, not a rigid rule

---

**Created:** 2025-11-30  
**Author:** Mary (Business Analyst)
