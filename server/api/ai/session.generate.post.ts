import { z } from 'zod'
import { defineEventHandler, readBody, createError } from 'h3'
import { serverSupabaseUser } from '#supabase/server'
import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { profiles } from '../../../db/schema'

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

const SessionPlan = z.object({ exercises: z.array(Exercise) })

const InputSchema = z.object({
  modality: z.enum(['strength', 'cardio', 'hiit', 'crossfit', 'rehab']),
  focus: z.string().optional().nullable(), // For strength: chest, back, legs, etc.; for cardio: running, cycling, etc.
  sessionLengthMin: z.number().int().positive().default(45),
  day: z.number().int().positive().optional(),
  constraints: z.record(z.any()).default({}),
})

export default defineEventHandler(async (event) => {
  // Get authenticated user
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }

  // Parse and validate request body
  const body = await readBody(event)
  const parsed = InputSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      message: 'Invalid input',
      data: parsed.error.flatten(),
    })
  }

  // Connect to database
  const config = useRuntimeConfig()
  const connectionString = config.databaseUrl
  if (!connectionString) {
    throw createError({
      statusCode: 500,
      message: 'Database configuration missing',
    })
  }

  const pg = postgres(connectionString)
  const db = drizzle(pg)

  try {
    // Fetch user profile
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, user.sub)).limit(1)

    if (!profile) {
      throw createError({
        statusCode: 404,
        message: 'User profile not found. Please complete onboarding first.',
      })
    }

    // Map profile to AI format
    const userProfile = {
      experience: profile.experienceLevel || 'beginner',
      units: profile.units || 'metric',
      equipment: [], // TODO: Add equipment field to profile schema
      goals: profile.goals || 'general_strength',
    }

    // Build AI prompts
    // TODO: take previous workout history (similar session performed before that user reviewed positively) into consideration
    const systemPrompt = `You are an expert fitness coach and workout session designer.

CRITICAL REQUIREMENTS:
- Session duration must be within the specified time limit
- Consider warm-up, work sets, and rest periods when calculating total time
- For beginners, use fewer exercises with more rest time
- MUST return valid JSON with an "exercises" array
- Set unused fields to null (not undefined or omitted)
- For strength sessions, use the provided focus to guide exercise selection
- For cardio sessions, use the provided focus to guide cardio type selection

EXERCISE TYPES (all include "type" and "name" fields):
- "strength": { type: "strength", name, sets, reps, loadKg, rir, restSec }
  Example: { "type": "strength", "name": "Bench Press", "sets": 4, "reps": 8, "loadKg": 60, "rir": 2, "restSec": 120 }
- "cardio": { type: "cardio", name, durationMin, intensity: "easy"|"moderate"|"hard", distanceKm }
  Example: { "type": "cardio", "name": "Running", "durationMin": 20, "intensity": "moderate", "distanceKm": 3 }
- "hiit": { type: "hiit", name, rounds, workSec, restSec, modality }
  Example: { "type": "hiit", "name": "Burpees", "rounds": 5, "workSec": 30, "restSec": 30, "modality": "bodyweight" }
- "crossfit": { type: "crossfit", name, format: "AMRAP"|"ForTime"|"EMOM", durationMin, components: [] }
  Example: { "type": "crossfit", "name": "Cindy", "format": "AMRAP", "durationMin": 20, "components": ["5 Pull-ups", "10 Push-ups", "15 Squats"] }
- "rehab": { type: "rehab", name, sets, reps, painCeiling, tempo }
  Example: { "type": "rehab", "name": "Shoulder Rotations", "sets": 3, "reps": 12, "painCeiling": 2, "tempo": "2-0-2-0" }

OUTPUT FORMAT:
{
  "exercises": [
    { exercise objects here }
  ]
}
`

    const userPrompt = `Generate a ${parsed.data.modality} workout session for ${parsed.data.sessionLengthMin} minutes.
${parsed.data.focus ? `Focus: ${parsed.data.focus}` : ''}
User: ${userProfile.experience} level, ${userProfile.units} units.
Goals: ${userProfile.goals}.
`

    // Call AI service with structured outputs
    const aiResponse = await callCloudflareAI({
      systemPrompt,
      userPrompt,
      temperature: 0.5,
      maxRetries: 2,
      responseSchema: SessionPlan,
      schemaName: 'SessionPlan',
    })

    if (!aiResponse.success || !aiResponse.data) {
      throw createError({
        statusCode: 500,
        message: aiResponse.error || 'Failed to generate session',
      })
    }

    console.log('[AI Session] AI response data type:', typeof aiResponse.data)
    console.log('[AI Session] AI response data:', JSON.stringify(aiResponse.data, null, 2))

    // When using zodResponseFormat, the response is wrapped with the schema name as key
    // Extract the actual data from the wrapper
    let sessionData = aiResponse.data

    // Check if data is wrapped with schema name
    if (sessionData && typeof sessionData === 'object' && 'SessionPlan' in sessionData) {
      console.log('[AI Session] Extracting data from SessionPlan wrapper')
      sessionData = sessionData.SessionPlan
    }

    // Handle case where AI might return array directly instead of wrapped in object
    if (Array.isArray(sessionData)) {
      console.log('[AI Session] AI returned array, wrapping in object')
      sessionData = { exercises: sessionData }
    }

    // Validate AI response
    const result = SessionPlan.safeParse(sessionData)
    if (!result.success) {
      console.error('[AI Session] Validation error:', result.error.flatten())
      console.error('[AI Session] Failed data:', JSON.stringify(sessionData).substring(0, 500))
      throw createError({
        statusCode: 500,
        message: 'Invalid session generated. Please try again.',
        data: result.error.flatten(),
      })
    }

    return result.data
  } catch (error: any) {
    console.error('Session generation error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to generate session',
    })
  } finally {
    await pg.end()
  }
})
