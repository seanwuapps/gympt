import { z } from 'zod'

// Define the schema as it is in the code
const Exercise = z.object({
  type: z.enum(['strength', 'cardio', 'hiit', 'crossfit', 'rehab']),
  name: z.string(),
  // Strength fields
  sets: z.number().int().positive().nullable().default(null),
  reps: z
    .union([z.number().int().positive(), z.tuple([z.number(), z.number()])])
    .nullable()
    .default(null),
  loadKg: z.number().nonnegative().nullable().default(null),
  rir: z.number().min(0).max(5).nullable().default(null),
  restSec: z.number().int().positive().nullable().default(null),
  // Cardio fields
  durationMin: z.number().nullable().default(null),
  intensity: z.enum(['easy', 'moderate', 'hard']).nullable().default(null),
  distanceKm: z.number().nullable().default(null),
  // HIIT fields
  rounds: z.number().int().nullable().default(null),
  workSec: z.number().int().nullable().default(null),
  // Crossfit fields
  format: z.enum(['AMRAP', 'ForTime', 'EMOM']).nullable().default(null),
  components: z.array(z.string()).nullable().default(null),
  // Rehab fields
  painCeiling: z.number().max(3).nullable().default(null),
  tempo: z.string().nullable().default(null),
  // HIIT modality
  modality: z.string().nullable().default(null),
})

const SessionPlan = z.object({
  warmup: z.array(Exercise),
  workout: z.array(Exercise),
  cardio: z.array(Exercise).optional().default([]),
  cooldown: z.array(Exercise),
  reasons: z.string().nullable().default(null),
})

// Mock AI response that matches the error description
const mockAiResponse = {
  warmup: [
    {
      // Missing type
      // Missing name
      intensity: 'low', // Invalid enum
    },
    {
      // Missing type
      // Missing name
      intensity: 'low',
    },
    {
      // Missing type
      // Missing name
      intensity: 'low',
    },
  ],
  workout: [
    {
      // Missing type
      // Missing name
    },
    {
      // Missing type
      // Missing name
    },
    {
      // Missing type
      // Missing name
    },
    {
      // Missing type
      // Missing name
    },
  ],
  cardio: null, // Invalid type (expected array or undefined)
  cooldown: [
    {
      // Missing type
      // Missing name
      intensity: 'low',
    },
    {
      // Missing type
      // Missing name
      intensity: 'low',
    },
    {
      // Missing type
      // Missing name
      intensity: 'low',
    },
  ],
  reasons: 'Some reasons',
}

console.log('Testing schema validation with mock invalid data...')
const result = SessionPlan.safeParse(mockAiResponse)

if (!result.success) {
  console.log('Validation failed as expected:')
  console.log(JSON.stringify(result.error.issues, null, 2))
} else {
  console.log('Validation unexpectedly succeeded!')
}
