# Schema Update: Focus for Training Plans

## Summary

Updated the training plan schema and session generation logic to include **focus information** for all modalities. This allows the AI session generator to create targeted exercises/workouts (e.g., chest for strength, running for cardio) instead of just generic sessions.

## Problem

The previous schema only stored a modality string (e.g., "strength", "cardio") in the training plan's weekly schedule. When generating a session, the AI only received:

- `modality: "strength"` ❌ Not enough information

What it needed:

- `modality: "strength"`, `focus: "chest"` ✅ Proper context
- `modality: "cardio"`, `focus: "running"` ✅ Even more specific for other modalities

## Solution

### 1. **Database Schema Change** (`db/schema/training-plans.ts`)

Created a new `DayPlan` interface to replace the simple string modality:

```typescript
export interface DayPlan {
  modality: 'strength' | 'cardio' | 'hiit' | 'crossfit' | 'rehab' | 'rest'
  focus?: string // For strength: chest, back, legs, arms, shoulders, full_body, push, pull, upper, lower, etc.
  // For cardio: running, cycling, swimming, rowing, etc.
}
```

Updated `weeklySchedule` type:

- **Before**: `Record<string, Record<string, string>>`
- **After**: `Record<string, Record<string, DayPlan>>`

### 2. **Validation Schema Change** (`server/shared/schemas/training-plan.ts`)

Added `DayPlanSchema` to validate day plans:

```typescript
export const DayPlanSchema = z.object({
  modality: z.enum(['strength', 'cardio', 'hiit', 'crossfit', 'rehab', 'rest']),
  focus: z.string().max(50).optional(), // e.g., "chest", "back", "legs" for strength; "running", "cycling" for cardio
})
```

Updated `TrainingPlanAIResponseSchema` to accept:

- New object format: `{ "modality": "strength", "focus": "chest" }`
- Legacy string format for backward compatibility: `"strength"`

### 3. **AI Prompt Updates** (`server/shared/prompts/plans.ts`)

**System Prompt:**

- Now instructs AI to return objects with modality and focus
- Specifies valid focus options for all applicable modalities:
  - **Strength focus**: chest, back, legs, arms, shoulders, full_body, push, pull, upper, lower, core, glutes
  - **Cardio focus** (optional): running, cycling, swimming, rowing, jumping_rope, elliptical, mixed
- Examples show proper JSON structure with objects

**User Prompt:**

- Asks AI to choose appropriate focus for strength and cardio days
- Emphasizes that focus provides variety in programming

### 4. **Plan Generation Endpoint** (`server/api/plans/generate.post.ts`)

Added conversion logic to handle backward compatibility:

- If AI returns a string (legacy format), converts to `{ modality: string }`
- Processes the weekly schedule to ensure all days are DayPlan objects

### 5. **Session Creation Schema** (`server/shared/schemas/session.ts`)

Updated `CreateSessionSchema`:

- Added `focus: z.string().optional()`
- Changed modality from string to enum with valid values

### 6. **Session Generation Endpoint** (`server/api/ai/session.generate.post.ts`)

**Input Schema:**

- Added `focus: z.string().optional()`
- Made modality an enum instead of string

**System Prompt:**

- Now mentions: "For strength sessions, use the provided focus to guide exercise selection"
- Also mentions: "For cardio sessions, use the provided focus to guide cardio type selection"

**User Prompt:**

- Now includes focus in context: `Focus: ${focus}`
- This guides the AI to generate specific exercises for that focus

## Data Flow Example

### Plan Generation

```
AI Input: "Create a 4-week plan for an intermediate lifter"
AI Output:
{
  "name": "Intermediate Strength Plan",
  "duration_weeks": 4,
  "weekly_schedule": {
    "week1": {
      "Mon": { "modality": "strength", "focus": "chest" },
      "Tue": { "modality": "cardio" },
      "Wed": { "modality": "strength", "focus": "back" },
      ...
    }
  }
}
```

### Session Generation

```
Fetch day from plan:
{
  "modality": "strength",
  "focus": "chest"
}

Session Generation Request:
{
  "modality": "strength",
  "focus": "chest",
  "sessionLengthMin": 45
}

AI generates chest-specific exercises:
- Bench Press
- Incline Dumbbell Press
- Cable Flyes
- Decline Push-ups
```

## Important: "Change Day Plan" Feature Update ✅ DONE

**Status**: Updated and ready to use with focus

The "change day plan" feature has been updated to support focus:

### Frontend (`app/stores/plans.ts`)

- `updatePlanDay()` now accepts optional `focus` parameter
- Sends focus to backend when provided
- Updates local state with DayPlan objects

### Backend (`server/api/plans/[id].patch.ts`)

- Now accepts and validates `focus` parameter
- Updates weeklySchedule to use new DayPlan object structure
- Validates modality against allowed types
- Handles both old string format and new object format

### Updated Data Format

**Before:**

```typescript
// Request
{ week: "week1", day: "Mon", modality: "strength" }

// Stored as
weeklySchedule["week1"]["Mon"] = "strength"
```

**After:**

```typescript
// Request with focus
{ week: "week1", day: "Mon", modality: "strength", focus: "chest" }

// Stored as
weeklySchedule["week1"]["Mon"] = {
  modality: "strength",
  focus: "chest"
}

// Or without focus (optional for non-required modalities)
weeklySchedule["week1"]["Mon"] = {
  modality: "cardio",
  focus: "running"
}
```

## Backward Compatibility

✅ **Full backward compatibility maintained:**

- If an old plan (with string modalities) is fetched, it still works
- Plan generation handles both old and new formats
- Session generation gracefully uses focus if provided, ignores if not

## Focus Options

**STRENGTH FOCUS (mandatory for strength days):**

- `"chest"` - chest-focused strength work
- `"back"` - back-focused strength work
- `"legs"` - leg-focused strength work
- `"arms"` - arm-focused strength work
- `"shoulders"` - shoulder-focused strength work
- `"full_body"` - full body strength work
- `"push"` - push-focused (chest, shoulders, triceps)
- `"pull"` - pull-focused (back, biceps)
- `"upper"` - upper body strength work
- `"lower"` - lower body strength work
- `"core"` - core-focused strength work
- `"glutes"` - glute-focused strength work

**CARDIO FOCUS (optional):**

- `"running"` - running/jogging cardio
- `"cycling"` - cycling/stationary bike cardio
- `"swimming"` - swimming cardio
- `"rowing"` - rowing cardio
- `"jumping_rope"` - jumping rope cardio
- `"elliptical"` - elliptical cardio
- `"mixed"` - mixed modality cardio

## Files Modified

1. ✅ `db/schema/training-plans.ts` - Added DayPlan interface with focus field
2. ✅ `server/shared/schemas/training-plan.ts` - Updated validation with focus
3. ✅ `server/shared/prompts/plans.ts` - Updated AI prompts for all modalities
4. ✅ `server/api/plans/generate.post.ts` - Added conversion logic
5. ✅ `server/shared/schemas/session.ts` - Added focus field
6. ✅ `server/api/ai/session.generate.post.ts` - Updated to use focus
7. ✅ `server/api/sessions/index.post.ts` - Ready to accept focus
8. ✅ `server/api/plans/[id].patch.ts` - Updated to handle DayPlan objects with focus
9. ✅ `app/stores/plans.ts` - Updated updatePlanDay() to support focus

## Next Steps

1. **Database Migration**: Create a migration to add the new schema structure (if needed - Drizzle may auto-handle)
2. **Day Suggestions Update** (Optional): Update the day suggestion system to include focus options when suggesting days
3. **Session Creation UI**: Update the UI component that creates sessions to:
   - Extract focus from the plan's DayPlan object
   - Pass focus to session generation endpoint
4. **Testing**: Test end-to-end flow with the new focus information

## Testing Checklist

- [ ] Generate a new training plan - verify focus is populated for appropriate days
- [ ] Create a session from a plan with focus - verify AI receives focus context
- [ ] Verify generated exercises match the focus (chest day has chest exercises, running day generates running sessions, etc.)
- [ ] Verify old plans still work (backward compatibility)
- [ ] Test session generation without focus (should still work)
