# User Story: Profile Gym/Equipment Setup

**Epic:** User Profile Enhancements (M1.4)  
**Story Type:** Brownfield Enhancement  
**Estimated Effort:** 3-4 hours  
**Priority:** High  
**Status:** Ready for Development  
**Sequence:** 2 of 3 (Profile Personalization Series)

---

## User Story

**As a** gym user with specific equipment available,  
**I want** to specify my training environment (home gym, commercial gym, etc.),  
**So that** the AI generates exercises that I can actually perform with my available equipment.

---

## Story Context

### Current State

- Profile has no equipment/gym context
- AI generates exercises assuming full gym access
- Users may receive exercises they cannot perform
- No way to indicate equipment limitations upfront

### Target State

- Gym setup field with predefined options
- Each option maps to typical equipment availability
- AI prompts include equipment context for exercise selection
- More relevant exercise recommendations from the start

### User Value

- **Relevance**: Exercises match available equipment
- **Convenience**: No need to list every piece of equipment
- **Reduced Friction**: Fewer exercise swaps needed during sessions

---

## Acceptance Criteria

### Functional Requirements

#### 1. Database Schema

- [ ] Add `gym_setup` column to `profiles` table
- [ ] Type: text enum with predefined values
- [ ] Column is NOT NULL (required field)
- [ ] Create database migration

#### 2. Gym Setup Options

| Value           | Label                   | AI Context (Equipment Available)                                                                       |
| --------------- | ----------------------- | ------------------------------------------------------------------------------------------------------ |
| `home_basic`    | Home (Basic Equipment)  | Dumbbells (light-medium), resistance bands, yoga mat, bodyweight exercises only                        |
| `home_equipped` | Home (Well-Equipped)    | Dumbbells (full range), barbell with plates, adjustable bench, pull-up bar, cable machine or bands     |
| `commercial`    | Commercial Gym          | Full range of machines, free weights, cables, cardio equipment, benches, racks                         |
| `functional`    | Functional/CrossFit Gym | Barbells, bumper plates, kettlebells, boxes, rowers, assault bikes, rings, pull-up rigs                |
| `outdoor`       | Outdoor/Minimal         | Parks, pull-up bars, bodyweight exercises, portable resistance bands, minimal equipment                |
| `other`         | Other                   | General exercises suitable for most environments, user will exclude specific exercises that don't work |

#### 3. Onboarding Integration

- [ ] Add gym setup dropdown to Onboarding Step 1 (Basics)
- [ ] Field is required - cannot proceed without selection
- [ ] Position after gender selection
- [ ] Show brief description of what each option means

#### 4. Profile Edit Integration

- [ ] Add gym setup dropdown to Profile Edit form
- [ ] Display in "Training Preferences" section
- [ ] Pre-populate with current value

#### 5. Profile View Integration

- [ ] Display gym setup in profile view page
- [ ] Label: "Training Environment"

#### 6. AI Prompt Integration

- [ ] Include gym setup context in `getTrainingPlanUserPrompt()`
- [ ] Include gym setup context in `getRehabPlanUserPrompt()`
- [ ] Include gym setup context in session generation prompts
- [ ] Map each option to specific equipment constraints

---

## Technical Implementation

### Database Migration

```sql
-- Add gym_setup column to profiles table
ALTER TABLE profiles
ADD COLUMN gym_setup TEXT NOT NULL DEFAULT 'commercial'
CHECK (gym_setup IN ('home_basic', 'home_equipped', 'commercial', 'functional', 'outdoor', 'other'));
```

### Schema Update

```typescript
// db/schema/profiles.ts
export const profiles = pgTable('profiles', {
  // ... existing fields
  gymSetup: text('gym_setup', {
    enum: ['home_basic', 'home_equipped', 'commercial', 'functional', 'outdoor', 'other'],
  })
    .notNull()
    .default('commercial'),
  // ... rest of fields
})
```

### Store Interface Update

```typescript
// app/stores/profile.store.ts
export interface ProfileFormData {
  gymSetup: 'home_basic' | 'home_equipped' | 'commercial' | 'functional' | 'outdoor' | 'other'
  // ... existing fields
}
```

### UI Options with Descriptions

```typescript
const gymSetupOptions = [
  {
    value: 'home_basic',
    label: 'Home (Basic Equipment)',
    description: 'Dumbbells, bands, mat, bodyweight',
  },
  {
    value: 'home_equipped',
    label: 'Home (Well-Equipped)',
    description: 'Dumbbells, barbell, bench, pull-up bar',
  },
  {
    value: 'commercial',
    label: 'Commercial Gym',
    description: 'Full machines, free weights, cables, cardio',
  },
  {
    value: 'functional',
    label: 'Functional/CrossFit Gym',
    description: 'Barbells, kettlebells, boxes, rowers, rings',
  },
  {
    value: 'outdoor',
    label: 'Outdoor/Minimal',
    description: 'Parks, bodyweight, portable equipment',
  },
  {
    value: 'other',
    label: 'Other',
    description: 'Mixed environment, will exclude unavailable exercises',
  },
]
```

### AI Equipment Context Mapping

```typescript
// server/shared/prompts/plans.ts

const GYM_SETUP_CONTEXT: Record<string, string> = {
  home_basic: `
EQUIPMENT AVAILABLE (Home - Basic):
- Light to medium dumbbells (up to ~20kg/45lb)
- Resistance bands
- Yoga/exercise mat
- Bodyweight exercises
EQUIPMENT NOT AVAILABLE: Barbells, cable machines, gym machines, heavy weights, benches, pull-up bars (unless specified)
EXERCISE SELECTION: Prioritize dumbbell exercises, band exercises, and bodyweight movements. Avoid machine-based or barbell exercises.`,

  home_equipped: `
EQUIPMENT AVAILABLE (Home - Well-Equipped):
- Full range of dumbbells
- Barbell with weight plates
- Adjustable bench (flat/incline)
- Pull-up bar
- Possibly cables or heavy bands
EQUIPMENT NOT AVAILABLE: Most gym machines (leg press, lat pulldown machine, etc.)
EXERCISE SELECTION: Free weight exercises, barbell movements, dumbbell work, pull-ups, bench work. Substitute machines with free weight alternatives.`,

  commercial: `
EQUIPMENT AVAILABLE (Commercial Gym):
- Full range of machines (chest press, leg press, lat pulldown, cable crossover, etc.)
- Complete free weight section (dumbbells, barbells, EZ bars)
- Multiple benches and racks
- Cable machines
- Cardio equipment (treadmills, bikes, rowers)
EXERCISE SELECTION: Full exercise variety available. Can use any standard gym exercise.`,

  functional: `
EQUIPMENT AVAILABLE (Functional/CrossFit Gym):
- Olympic barbells and bumper plates
- Kettlebells (various weights)
- Plyo boxes
- Rowing machines, assault bikes
- Gymnastic rings, pull-up rigs
- Medicine balls, slam balls
- Battle ropes
EQUIPMENT NOT AVAILABLE: Traditional gym machines (leg press, chest press machines, etc.)
EXERCISE SELECTION: Compound movements, Olympic lifts, kettlebell work, gymnastics movements, functional fitness exercises. Avoid isolation machines.`,

  outdoor: `
EQUIPMENT AVAILABLE (Outdoor/Minimal):
- Outdoor pull-up bars (park)
- Bodyweight exercises
- Portable resistance bands (if any)
- Running/walking paths
- Park benches for step-ups, dips
EQUIPMENT NOT AVAILABLE: Weights, machines, gym equipment
EXERCISE SELECTION: Bodyweight-only exercises (push-ups, pull-ups, squats, lunges, dips, planks). Running, sprints, hill work. Calisthenics focus.`,

  other: `
EQUIPMENT AVAILABLE (Mixed/Other):
- Assume basic gym equipment availability
- User will manually exclude exercises that don't work for their setup
EXERCISE SELECTION: Use common exercises that work in most environments. User will swap or exclude exercises as needed.`,
}

export function getGymSetupContext(gymSetup: string): string {
  return GYM_SETUP_CONTEXT[gymSetup] || GYM_SETUP_CONTEXT.other
}
```

### Updated AI Prompt

```typescript
export function getTrainingPlanUserPrompt(input: PlanGenerationInput): string {
  const { profile } = input

  const genderContext = profile.gender !== 'other' ? `- Gender: ${profile.gender}` : ''

  const equipmentContext = getGymSetupContext(profile.gymSetup)

  return `Create a personalized training plan with the following parameters:

USER PROFILE:
${genderContext}
- Goals: ${profile.goals || 'general fitness'}
- Experience Level: ${profile.experienceLevel}
- Preferred Training Days: ${(profile.preferredTrainingDays as string[]).join(', ')}
- Injury Flags: ${profile.injuryFlags || 'none'}
- Progression Pace: ${profile.aggressiveness}

${equipmentContext}

REQUIREMENTS:
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
│  [Beginner ▼]                   │
│                                 │
│  Gender *                       │
│  [Male ▼]                       │
│                                 │
│  Training Environment *         │
│  ┌─────────────────────────┐   │
│  │ Commercial Gym       ▼  │   │
│  └─────────────────────────┘   │
│  Full machines, free weights,  │
│  cables, cardio                │
│                                 │
│  Preferred Training Days *      │
│  [☑ Mon ☐ Tue ☑ Wed ...]       │
│                                 │
└─────────────────────────────────┘
```

### Dropdown with Descriptions

```
┌─────────────────────────────────────┐
│ Home (Basic Equipment)              │
│ Dumbbells, bands, mat, bodyweight   │
├─────────────────────────────────────┤
│ Home (Well-Equipped)                │
│ Dumbbells, barbell, bench, pull-up  │
├─────────────────────────────────────┤
│ Commercial Gym              ✓       │
│ Full machines, free weights, cables │
├─────────────────────────────────────┤
│ Functional/CrossFit Gym             │
│ Barbells, kettlebells, boxes, rowers│
├─────────────────────────────────────┤
│ Outdoor/Minimal                     │
│ Parks, bodyweight, portable equip.  │
├─────────────────────────────────────┤
│ Other                               │
│ Mixed environment                   │
└─────────────────────────────────────┘
```

---

## Tasks

### Phase 1: Data Layer (30-45 min)

- [ ] Create migration file in `db/migrations/`
- [ ] Update `db/schema/profiles.ts` with gymSetup field
- [ ] Run migration locally
- [ ] Verify column exists in database

### Phase 2: Store & Types (15-20 min)

- [ ] Update `ProfileFormData` interface in `profile.store.ts`
- [ ] Update API payload handling in `saveProfile()`

### Phase 3: Onboarding UI (45-60 min)

- [ ] Add gym setup dropdown to `OnboardingStep1.vue`
- [ ] Include description text below dropdown
- [ ] Add validation (required field)
- [ ] Update `canProceedStep1` computed property
- [ ] Style dropdown to show descriptions

### Phase 4: Profile Edit UI (30-40 min)

- [ ] Add gym setup dropdown to `ProfileFormTrainingPreferences.vue`
- [ ] Include description display
- [ ] Ensure pre-population from existing profile
- [ ] Test save functionality

### Phase 5: Profile View (10-15 min)

- [ ] Add gym setup display to profile details in `/profile/index.vue`
- [ ] Use friendly label (not raw value)

### Phase 6: AI Integration (45-60 min)

- [ ] Create `getGymSetupContext()` helper function
- [ ] Update `getTrainingPlanUserPrompt()` in `plans.ts`
- [ ] Update `getRehabPlanUserPrompt()` in `plans.ts`
- [ ] Update session generation prompts (if separate)
- [ ] Update exercise swap prompts to respect equipment

---

## Files to Modify

| File                                                        | Change                              |
| ----------------------------------------------------------- | ----------------------------------- |
| `db/migrations/XXXX_add_gym_setup.sql`                      | New migration file                  |
| `db/schema/profiles.ts`                                     | Add gymSetup column                 |
| `app/stores/profile.store.ts`                               | Update ProfileFormData interface    |
| `app/stores/onboarding.ts`                                  | Add gymSetup to form data           |
| `app/components/onboarding/OnboardingStep1.vue`             | Add gym setup dropdown              |
| `app/components/profile/ProfileFormTrainingPreferences.vue` | Add gym setup dropdown              |
| `app/pages/profile/index.vue`                               | Display gym setup in view           |
| `server/shared/prompts/plans.ts`                            | Add equipment context to AI prompts |

---

## Definition of Done

- [ ] Gym setup field exists in database
- [ ] Migration runs successfully
- [ ] Gym setup is required in onboarding (cannot skip)
- [ ] Gym setup displays in profile view with friendly label
- [ ] Gym setup is editable in profile edit
- [ ] AI prompts include equipment context
- [ ] Generated exercises respect equipment constraints
- [ ] No console errors
- [ ] Existing profiles default to "commercial"

---

## Testing Scenarios

1. **Home Basic User**: Generate plan → should see bodyweight, dumbbell, band exercises only
2. **Outdoor User**: Generate plan → should see bodyweight/calisthenics only
3. **Commercial Gym User**: Generate plan → should see full variety including machines
4. **Functional Gym User**: Generate plan → should see kettlebells, Olympic lifts, no machines

---

## Out of Scope

- Individual equipment checkboxes (too complex for users)
- Equipment inventory management
- Custom equipment lists
- Equipment-specific exercise database

---

## Notes

- Default to "commercial" for backward compatibility (most permissive)
- Users can still use exercise exclusion (Story 3) for fine-tuning
- AI should treat these as guidelines, not hard rules
- Exercise swap should also respect equipment context

---

**Created:** 2025-11-30  
**Author:** Mary (Business Analyst)
