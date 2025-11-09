# Session Preview Feature

## Overview
Implemented a preview screen that displays generated workout sessions before they start, allowing users to review and swap individual exercises.

## User Flow

1. **Generate Session** (Home page)
   - User selects a day from their training plan
   - Chooses session length
   - AI generates workout with exercises

2. **Preview Session** (`/session/preview`)
   - User reviews all exercises
   - Can swap any exercise with AI-generated alternative
   - Exercises maintain same modality as original
   - Swap button on each exercise card
   - "Start Workout" button to begin session
   - "Cancel" button to discard session

3. **Active Session** (`/session`)
   - Session starts only after user confirms from preview
   - No more auto-start behavior
   - User completes workout

## Files Created

### Frontend
- **`app/pages/session/preview.vue`** - Preview page component
  - Displays all exercises with details
  - Swap button for each exercise
  - Start/Cancel actions
  - Mobile-responsive design
  - Loading states for swap operations

### Backend
- **`server/api/sessions/[id]/swap-exercise.post.ts`** - Exercise swap endpoint
  - Validates session ownership
  - Generates new exercise via AI
  - Excludes existing exercises to avoid duplicates
  - Updates session in database
  - Returns new exercise

### Store
- **`app/stores/session.ts`** - Added `swapExercise` method
  - Calls swap API endpoint
  - Updates current session state
  - Handles errors

## Files Modified

### Navigation Flow
- **`app/pages/index.vue`**
  - Changed navigation from `/session` to `/session/preview`
  - Users now review before starting

### Session Page
- **`app/pages/session.vue`**
  - Removed auto-start logic
  - Updated to use flat exercise structure
  - Added support for crossfit components display
  - Added styles for full-width target items

### Type Definitions
- **`app/stores/session.ts`**
  - Updated `SessionExercise` interface to flat structure
  - Removed nested target interfaces
  - All type-specific fields are optional/nullable

## API Endpoints

### POST `/api/sessions/[id]/swap-exercise`
Swaps a single exercise in a session with an AI-generated alternative.

**Request:**
```json
{
  "exerciseIndex": 0
}
```

**Response:**
```json
{
  "success": true,
  "exercise": {
    "type": "strength",
    "name": "Dumbbell Press",
    "sets": 4,
    "reps": 10,
    "loadKg": 20,
    "rir": 2,
    "restSec": 90,
    // ... other nullable fields
  }
}
```

**Features:**
- Validates session ownership
- Maintains same modality as original exercise
- Excludes existing exercises to prevent duplicates
- Updates session in database
- Returns validated exercise

## UI/UX Features

### Preview Screen
- **Exercise Cards**
  - Numbered indicators (1, 2, 3...)
  - Exercise name prominently displayed
  - Type-specific target details
  - Swap button (refresh icon) on each card
  
- **Loading States**
  - Individual swap buttons show loading spinner
  - Prevents multiple simultaneous swaps
  
- **Actions**
  - Primary: "Start Workout" (green, prominent)
  - Secondary: "Cancel" (text button)
  
- **Responsive Design**
  - Mobile-first approach
  - Cards stack vertically
  - Touch-friendly button sizes
  - Bottom padding for navigation bar

### Exercise Display
- **Conditional Rendering**
  - Only shows fields relevant to exercise type
  - Null/undefined fields are hidden
  
- **Type-Specific Layouts**
  - Strength: sets, reps, load, RIR, rest
  - Cardio: duration, intensity, distance
  - HIIT: rounds, work time, rest time, modality
  - Crossfit: format, duration, components list
  - Rehab: sets, reps, pain ceiling, tempo

## Technical Details

### Exercise Swap Logic
1. User clicks swap button on exercise
2. Frontend calls `/api/sessions/[id]/swap-exercise`
3. Backend fetches session and validates ownership
4. AI generates single exercise of same modality
5. Excludes existing exercise names to avoid duplicates
6. Validates new exercise against schema
7. Updates session in database
8. Returns new exercise to frontend
9. Frontend updates local state immediately

### State Management
- Session stored in Pinia store
- Preview page reads from `currentSession`
- Swap updates `currentSession` in place
- Changes persist to database
- Session page reads updated exercises

### Error Handling
- Toast notifications for all errors
- Swap failures don't break UI
- Loading states prevent duplicate requests
- Validation errors shown to user

## Benefits

1. **User Control** - Review before committing to workout
2. **Flexibility** - Swap exercises that don't fit
3. **Confidence** - See full workout before starting
4. **Better UX** - No surprises during workout
5. **AI Quality** - Iterate until satisfied

## Future Enhancements

- Swap multiple exercises at once
- Provide swap reason/preferences
- Save favorite exercises
- Exercise history/recommendations
- Manual exercise editing
- Drag-and-drop reordering
