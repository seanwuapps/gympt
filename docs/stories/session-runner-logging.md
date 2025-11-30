# User Story: Session Runner with Set Logging

**Epic:** Training Session Management (M1.3)  
**Story Type:** Brownfield Enhancement  
**Estimated Effort:** 12-16 hours  
**Priority:** High  
**Status:** Ready for Development

---

## User Story

**As a** gym user doing a workout,  
**I want** a step-by-step session runner that shows one exercise at a time with large controls to log my sets,  
**So that** I can focus on my workout without cognitive overload and accurately track my performance.

---

## Story Context

### Current State

- Session preview page exists (`/session/preview`) ✅
- Exercise swap functionality works ✅
- Session page (`/session/index.vue`) shows all exercises at once
- No set-by-set logging functionality
- No rest timer
- No step-by-step navigation
- Complete/Cancel buttons exist but don't capture workout data

### Target State

- One exercise displayed at a time (step-focused UI)
- Set-by-set logging with large, touch-friendly inputs
- Auto rest timer after completing each set
- Progress indicator showing current exercise/set
- Skip exercise functionality
- Complete session with logged data saved to database
- Session summary before final completion

### User Value

- **Focus**: See only the current exercise/set
- **Speed**: Large buttons for quick logging during rest
- **Accuracy**: Log immediately after each set (memory fresh)
- **Motivation**: Clear progress through workout

---

## Acceptance Criteria

### Functional Requirements

#### 1. Step-by-Step Exercise View

- [x] Show one exercise at a time (not full list)
- [x] Display exercise name prominently (large font)
- [x] Show target values (sets, reps, load, etc.) based on exercise type
- [x] Show current set number: "Set 2 of 4"
- [x] Progress bar or indicator showing workout progress

#### 2. Set Logging Controls (Strength)

- [x] Large number input for **Reps Completed** (stepper or numpad)
- [x] Large number input for **Load (kg)** with quick increment buttons (+2.5, +5)
- [x] "Complete Set" button (prominent, full-width)
- [x] Pre-fill inputs with target values as defaults
- [x] After last set: prompt for **Exercise RPE** (6-10 scale, optional)

#### 3. Set Logging Controls (Cardio)

- [x] Duration input (minutes:seconds or total minutes)
- [x] Distance input (km) - optional
- [x] Intensity selector (easy/moderate/hard)
- [x] "Complete Exercise" button

#### 4. Set Logging Controls (HIIT)

- [ ] Rounds completed counter
- [ ] Work/rest timer display
- [ ] "Complete Round" button
- [ ] Auto-progress through rounds

#### 5. Rest Timer

- [x] Auto-start countdown after set completion
- [x] Display remaining rest time prominently (large font)
- [ ] Audio/vibration alert when rest ends (if permitted)
- [x] "Skip Rest" button to proceed early
- [x] Timer uses exercise's `restSec` value (default 90s if not set)

#### 6. Exercise Navigation

- [x] "Next Exercise" appears after all sets complete
- [x] "Skip Exercise" button (confirms, marks as skipped)
- [x] Exercise progress: "Exercise 3 of 6"
- [x] Cannot go back to previous exercises (forward-only for simplicity)

#### 7. Session Completion

- [x] After last exercise, show session summary
- [x] Summary displays: exercises completed, total volume, duration
- [x] "Finish Workout" button saves all logged data
- [x] Redirect to home page with success toast

#### 8. Data Persistence

- [x] Logged sets saved to session record in database
- [x] Each set includes: type, reps, load, startedAt, completedAt, restTakenSec, skipped
- [x] Exercise completions saved with status and optional RPE
- [x] Session feedback (overall RPE, difficulty) collected on finish
- [x] Session duration calculated from startedAt to completedAt

### Integration Requirements

#### 9. Store Updates

- [x] Add `loggedSets` array to session state (type-specific per modality)
- [x] Add `exerciseCompletions` array for per-exercise RPE/status
- [x] Add `currentExerciseIndex`, `currentSetIndex`, `currentSetStartedAt` state
- [x] Add `restTimer` state with active, remaining, total, startedAt
- [x] Add actions: `logSet()`, `completeExercise()`, `skipExercise()`, `nextExercise()`
- [x] Add rest timer actions: `startRestTimer()`, `skipRest()`, `onRestComplete()`
- [x] Persist logged data on complete

#### 10. Database Schema

- [x] Add `logged_sets` JSONB column to sessions table
- [x] Add `exercise_completions` JSONB column to sessions table
- [x] Create migration for schema update
- [x] Update Drizzle schema types

#### 11. Backward Compatibility

- [x] Existing sessions without logged data still work
- [x] Preview page unchanged
- [x] Session generation unchanged

---

## Technical Implementation

### Data Structures

```typescript
// ============================================
// LOGGED SET TYPES (per modality)
// ============================================

// Base logged set (common fields)
interface LoggedSetBase {
  exerciseIndex: number // Which exercise (0-based index)
  setNumber: number // Which set (1-based: 1, 2, 3...)
  startedAt: string // When user started the set (ISO timestamp)
  completedAt: string // When user completed the set (ISO timestamp)
  skipped: boolean // If this set was skipped
  restTakenSec?: number // Actual rest taken before this set (null for set 1)
}

// Strength set
interface StrengthLoggedSet extends LoggedSetBase {
  type: 'strength'
  reps: number // Actual reps completed
  loadKg: number // Actual load used
}

// Cardio (single "set" per exercise)
interface CardioLoggedSet extends LoggedSetBase {
  type: 'cardio'
  durationMin: number // Actual duration
  distanceKm?: number // Actual distance (optional)
  intensity: 'easy' | 'moderate' | 'hard'
}

// HIIT round
interface HIITLoggedSet extends LoggedSetBase {
  type: 'hiit'
  round: number // Which round (1-based)
  workSec: number // Actual work time
  restSec: number // Actual rest time
}

// Rehab set
interface RehabLoggedSet extends LoggedSetBase {
  type: 'rehab'
  reps: number // Actual reps completed
  painLevel?: number // 0-3 scale (optional)
}

// CrossFit (single completion)
interface CrossfitLoggedSet extends LoggedSetBase {
  type: 'crossfit'
  completedRounds?: number // For AMRAP
  timeSeconds?: number // For ForTime
}

// Union type for all logged sets
type LoggedSet =
  | StrengthLoggedSet
  | CardioLoggedSet
  | HIITLoggedSet
  | RehabLoggedSet
  | CrossfitLoggedSet

// ============================================
// EXERCISE COMPLETION (RPE collected per exercise)
// ============================================

interface ExerciseCompletion {
  exerciseIndex: number
  status: 'completed' | 'skipped'
  rpe?: number // 6-10 scale, asked after exercise completes
  notes?: string // Optional notes for this exercise
}

// ============================================
// SESSION COMPLETION (feedback on finish)
// ============================================

interface SessionCompletion {
  sessionRPE: number // Overall session RPE (6-10)
  difficulty: 'too_easy' | 'just_right' | 'too_hard'
  notes?: string // Optional session notes
}

// ============================================
// SESSION RUNNER STATE (store additions)
// ============================================

interface SessionRunnerState {
  // Navigation
  currentExerciseIndex: number
  currentSetIndex: number

  // Logged data
  loggedSets: LoggedSet[]
  exerciseCompletions: ExerciseCompletion[]

  // Current set tracking
  currentSetStartedAt: string | null // When current set started

  // Rest timer
  restTimer: {
    active: boolean
    remaining: number // Seconds remaining
    total: number // Total rest time for this rest period
    startedAt: string | null // When rest started (to calculate actual rest taken)
  }

  // Session timing
  sessionStartedAt: string | null
}

// ============================================
// DATABASE SCHEMA (stored in sessions table)
// ============================================

// New JSONB columns to add:
// - logged_sets: LoggedSet[]
// - exercise_completions: ExerciseCompletion[]
//
// Existing columns used:
// - exercises: SessionExercise[] (target values - already exists)
// - feedback: SessionFeedback (session-level RPE - already exists)
// - started_at: timestamp (already exists)
// - completed_at: timestamp (already exists)
```

### Example Stored Data

```json
{
  "loggedSets": [
    {
      "type": "strength",
      "exerciseIndex": 0,
      "setNumber": 1,
      "reps": 8,
      "loadKg": 60,
      "skipped": false,
      "startedAt": "2025-11-29T10:05:00Z",
      "completedAt": "2025-11-29T10:05:30Z",
      "restTakenSec": null
    },
    {
      "type": "strength",
      "exerciseIndex": 0,
      "setNumber": 2,
      "reps": 8,
      "loadKg": 60,
      "skipped": false,
      "startedAt": "2025-11-29T10:07:05Z",
      "completedAt": "2025-11-29T10:07:35Z",
      "restTakenSec": 95
    },
    {
      "type": "strength",
      "exerciseIndex": 0,
      "setNumber": 3,
      "reps": 7,
      "loadKg": 60,
      "skipped": false,
      "startedAt": "2025-11-29T10:09:23Z",
      "completedAt": "2025-11-29T10:09:55Z",
      "restTakenSec": 108
    }
  ],
  "exerciseCompletions": [
    { "exerciseIndex": 0, "status": "completed", "rpe": 8 },
    { "exerciseIndex": 1, "status": "skipped" },
    { "exerciseIndex": 2, "status": "completed", "rpe": 7 }
  ],
  "feedback": {
    "sessionRPE": 7,
    "difficulty": "just_right",
    "notes": "Felt strong today"
  }
}
```

### Target Values

Target values come from the existing `exercises[]` array in the session:

- `exercises[i].sets`, `exercises[i].reps`, `exercises[i].loadKg` (strength)
- `exercises[i].durationMin`, `exercises[i].distanceKm` (cardio)
- etc.

No duplication needed - compare `loggedSets` against `exercises` for reporting.

### Store Actions

```typescript
// Initialize runner when entering session page
function initRunner() {
  currentExerciseIndex.value = 0
  currentSetIndex.value = 0
  loggedSets.value = []
  exerciseCompletions.value = []
  currentSetStartedAt.value = new Date().toISOString()
  sessionStartedAt.value = currentSession.value?.startedAt || new Date().toISOString()
}

// Log a completed set (strength example)
function logSet(data: { reps: number; loadKg: number }) {
  const now = new Date().toISOString()
  const exercise = currentSession.value!.exercises[currentExerciseIndex.value]

  // Calculate rest taken (time since last set completed)
  let restTakenSec: number | undefined
  if (currentSetIndex.value > 0) {
    const prevSet = loggedSets.value
      .filter((s) => s.exerciseIndex === currentExerciseIndex.value)
      .pop()
    if (prevSet && currentSetStartedAt.value) {
      restTakenSec = Math.round(
        (new Date(currentSetStartedAt.value).getTime() - new Date(prevSet.completedAt).getTime()) /
          1000
      )
    }
  }

  loggedSets.value.push({
    type: 'strength',
    exerciseIndex: currentExerciseIndex.value,
    setNumber: currentSetIndex.value + 1,
    reps: data.reps,
    loadKg: data.loadKg,
    skipped: false,
    startedAt: currentSetStartedAt.value!,
    completedAt: now,
    restTakenSec,
  })

  // Check if all sets complete for this exercise
  const totalSets = exercise.sets || 1
  if (currentSetIndex.value + 1 >= totalSets) {
    // All sets done - prompt for exercise RPE, then move to next
    // (UI will show RPE prompt before calling nextExercise)
  } else {
    // More sets - start rest timer
    currentSetIndex.value++
    startRestTimer(exercise.restSec || 90)
  }
}

// Complete exercise with RPE
function completeExercise(rpe?: number, notes?: string) {
  exerciseCompletions.value.push({
    exerciseIndex: currentExerciseIndex.value,
    status: 'completed',
    rpe,
    notes,
  })
  nextExercise()
}

// Skip entire exercise
function skipExercise() {
  exerciseCompletions.value.push({
    exerciseIndex: currentExerciseIndex.value,
    status: 'skipped',
  })
  nextExercise()
}

// Move to next exercise
function nextExercise() {
  const exercises = currentSession.value!.exercises
  if (currentExerciseIndex.value + 1 >= exercises.length) {
    // Session complete - show summary
    showSummary.value = true
  } else {
    currentExerciseIndex.value++
    currentSetIndex.value = 0
    currentSetStartedAt.value = new Date().toISOString()
  }
}

// Rest timer
function startRestTimer(seconds: number) {
  restTimer.value = {
    active: true,
    remaining: seconds,
    total: seconds,
    startedAt: new Date().toISOString(),
  }
  // Countdown handled by setInterval in component
}

function skipRest() {
  restTimer.value.active = false
  currentSetStartedAt.value = new Date().toISOString()
}

function onRestComplete() {
  restTimer.value.active = false
  currentSetStartedAt.value = new Date().toISOString()
}
```

### UI Components

#### New Components to Create

1. **`SessionRunner.vue`** - Main runner view (one exercise at a time)
2. **`SetLogger.vue`** - Set logging form with inputs
3. **`RestTimer.vue`** - Countdown timer display
4. **`SessionProgress.vue`** - Progress indicator
5. **`SessionSummary.vue`** - End-of-session summary

#### Component Structure

```
app/components/session/
├── SessionRunner.vue      # Main orchestrator
├── SetLogger.vue          # Logging inputs per exercise type
├── RestTimer.vue          # Countdown with skip
├── SessionProgress.vue    # Progress bar/indicator
└── SessionSummary.vue     # Post-workout summary
```

### Migration

```sql
-- Add logged_sets and exercise_completions columns to sessions table
ALTER TABLE sessions
ADD COLUMN logged_sets JSONB DEFAULT '[]'::jsonb,
ADD COLUMN exercise_completions JSONB DEFAULT '[]'::jsonb;
```

---

## UI/UX Design

### Session Runner Layout (Mobile-First)

```
┌─────────────────────────────────┐
│  Exercise 3 of 6    [Skip ▶]   │  <- Progress header
├─────────────────────────────────┤
│                                 │
│      BENCH PRESS               │  <- Exercise name (large)
│      Set 2 of 4                │  <- Current set
│                                 │
│  ┌─────────────────────────┐   │
│  │  Target: 8 reps @ 60kg  │   │  <- Target info
│  └─────────────────────────┘   │
│                                 │
│  ┌───────┐  ┌───────────────┐  │
│  │ REPS  │  │     LOAD      │  │
│  │  [-]  │  │  [-] 60 [+]   │  │  <- Large inputs
│  │   8   │  │      kg       │  │
│  │  [+]  │  │ [+2.5] [+5]   │  │
│  └───────┘  └───────────────┘  │
│                                 │
│  ┌─────────────────────────┐   │
│  │    ✓ COMPLETE SET       │   │  <- Primary action
│  └─────────────────────────┘   │
│                                 │
└─────────────────────────────────┘
```

### Exercise RPE Prompt (after last set of exercise)

```
┌─────────────────────────────────┐
│                                 │
│      ✓ BENCH PRESS DONE        │
│                                 │
│  How hard was this exercise?   │
│                                 │
│  ┌─────────────────────────┐   │
│  │  [6][7][8][9][10]       │   │  <- RPE buttons
│  │   Easy        Max       │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │      NEXT EXERCISE →    │   │  <- Continue
│  └─────────────────────────┘   │
│                                 │
│         [ Skip RPE ]           │  <- Optional skip
│                                 │
└─────────────────────────────────┘
```

### Rest Timer View

```
┌─────────────────────────────────┐
│                                 │
│           REST                  │
│                                 │
│          1:30                   │  <- Large countdown
│                                 │
│    ━━━━━━━━━━░░░░░░            │  <- Progress bar
│                                 │
│  ┌─────────────────────────┐   │
│  │      SKIP REST →        │   │
│  └─────────────────────────┘   │
│                                 │
│      Next: Set 3 of 4          │  <- Preview next
│                                 │
└─────────────────────────────────┘
```

### Session Summary

```
┌─────────────────────────────────┐
│       🎉 WORKOUT COMPLETE!     │
├─────────────────────────────────┤
│                                 │
│  Duration: 45 minutes          │
│  Exercises: 6 completed        │
│  Total Sets: 24                │
│  Total Volume: 4,500 kg        │
│                                 │
│  ─────────────────────────     │
│                                 │
│  Bench Press      4×8 @ 60kg   │
│  Incline DB Press 3×10 @ 20kg  │
│  Cable Flyes      3×12 @ 15kg  │
│  ...                           │
│                                 │
│  ┌─────────────────────────┐   │
│  │    FINISH WORKOUT       │   │
│  └─────────────────────────┘   │
│                                 │
└─────────────────────────────────┘
```

---

## Tasks

### Phase 1: Data Layer (2-3 hours)

- [x] Create migration for `logged_sets` column
- [x] Update session schema types
- [x] Add runner state to session store
- [x] Implement `logSet()`, `skipExercise()`, `nextExercise()` actions
- [x] Add `startSession()` call when runner opens

### Phase 2: Core Components (4-5 hours)

- [x] Create `SessionRunner.vue` main component
- [x] Create `SetLogger.vue` with type-specific inputs
  - [x] Strength: reps, load, RPE
  - [x] Cardio: duration, distance, intensity
  - [ ] HIIT: rounds, work/rest
  - [ ] Rehab: reps, pain level
- [x] Create `SessionProgress.vue` header
- [x] Create `RestTimer.vue` with countdown

### Phase 3: Integration (3-4 hours)

- [x] Replace current session page with runner
- [x] Wire up store actions to UI
- [x] Implement rest timer logic (countdown, auto-advance)
- [x] Add skip exercise confirmation

### Phase 4: Summary & Completion (2-3 hours)

- [x] Create `SessionSummary.vue`
- [x] Calculate workout stats (duration, volume, etc.)
- [x] Save logged sets to database on complete
- [x] Success toast and redirect

### Phase 5: Polish (1-2 hours)

- [ ] Test on mobile viewport
- [ ] Ensure touch targets are 44px minimum
- [ ] Add haptic feedback (if available)
- [ ] Handle edge cases (no sets, all skipped, etc.)
- [ ] Error handling and recovery

---

## Definition of Done

- [x] User can start session from preview page
- [x] One exercise shown at a time
- [x] Sets can be logged with reps/load/RPE
- [x] Rest timer auto-starts after each set
- [x] Rest timer can be skipped
- [x] Exercises can be skipped
- [x] Session summary shown at end
- [x] Logged data saved to database
- [ ] Works on mobile (touch-friendly)
- [ ] No console errors
- [ ] Progress tracker updated in PRD

---

## Out of Scope (Future)

- Edit previously logged sets
- Go back to previous exercise
- Pause/resume session
- Audio cues for timer
- Plate calculator
- PR detection
- Social sharing

---

## Notes

- Focus on **strength exercises first** (most common use case)
- Keep UI minimal - this is used during actual workouts
- Prioritize speed of logging over feature completeness
- Rest timer is critical UX - users rest between sets

---

**Created:** 2025-11-29  
**Author:** Mary (Business Analyst)
