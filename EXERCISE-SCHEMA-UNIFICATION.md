# Exercise Schema Unification

## Summary
Unified all exercise type schemas across the codebase to use a consistent flat structure that is compatible with OpenAI/Cloudflare Workers AI structured outputs.

## Changes Made

### 1. Session Generation API (`server/api/ai/session.generate.post.ts`)
- **Old Structure**: Discriminated union with nested `targets` object
- **New Structure**: Flat schema with all fields at top level, type-specific fields are nullable with defaults

### 2. Shared Session Schema (`server/shared/schemas/session.ts`)
- Removed separate target schemas (`StrengthTargetSchema`, `CardioTargetSchema`, etc.)
- Updated `SessionExerciseSchema` to match the flat structure
- All optional fields use `.nullable().default(null)` for compatibility

## New Exercise Structure

```typescript
{
  type: 'strength' | 'cardio' | 'hiit' | 'crossfit' | 'rehab',
  name: string,
  // All type-specific fields are nullable
  sets: number | null,
  reps: number | [number, number] | null,
  loadKg: number | null,
  rir: number | null,
  restSec: number | null,
  durationMin: number | null,
  intensity: 'easy' | 'moderate' | 'hard' | null,
  distanceKm: number | null,
  rounds: number | null,
  workSec: number | null,
  format: 'AMRAP' | 'ForTime' | 'EMOM' | null,
  components: string[] | null,
  painCeiling: number | null,
  tempo: string | null,
  modality: string | null
}
```

## Example Exercises

### Strength
```json
{
  "type": "strength",
  "name": "Bench Press",
  "sets": 4,
  "reps": 8,
  "loadKg": 60,
  "rir": 2,
  "restSec": 120,
  "durationMin": null,
  "intensity": null,
  "distanceKm": null,
  "rounds": null,
  "workSec": null,
  "format": null,
  "components": null,
  "painCeiling": null,
  "tempo": null,
  "modality": null
}
```

### Rehab
```json
{
  "type": "rehab",
  "name": "Shoulder Rotations",
  "sets": 3,
  "reps": 12,
  "painCeiling": 2,
  "tempo": "2-0-2-0",
  "loadKg": null,
  "rir": null,
  "restSec": null,
  "durationMin": null,
  "intensity": null,
  "distanceKm": null,
  "rounds": null,
  "workSec": null,
  "format": null,
  "components": null,
  "modality": null
}
```

## Benefits

1. **AI Compatibility**: Works with OpenAI structured outputs API which requires all fields to be either required or nullable (not optional)
2. **Consistency**: Same structure used across session generation and session storage
3. **Type Safety**: TypeScript/Zod validation ensures correct types
4. **Simplicity**: Single schema definition instead of multiple discriminated unions
5. **Flexibility**: Easy to add new exercise types or fields

## Technical Details

### Why `.nullable().default(null)` instead of `.optional()`?
- OpenAI structured outputs API doesn't support `.optional()` without `.nullable()`
- Using `.default(null)` allows Zod to automatically fill in missing fields
- This lets the AI only include relevant fields for each exercise type

### Why Flat Structure instead of Nested `targets`?
- Nested discriminated unions are complex for AI models to generate correctly
- Flat structure is simpler and more reliable
- Still maintains type safety through the `type` discriminator field

## Files Modified

1. `server/api/ai/session.generate.post.ts` - Session generation endpoint
2. `server/shared/schemas/session.ts` - Shared session schemas

## Migration Notes

- Existing sessions in the database may have the old nested structure
- Frontend components may need updates if they expect the old structure
- Consider adding a migration script if needed for existing data
