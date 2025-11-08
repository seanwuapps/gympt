import { z } from 'zod'
import { defineEventHandler, readBody, createError } from 'h3'
import { serverSupabaseUser } from '#supabase/server'
import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { profiles } from '../../../db/schema'

const StrengthTarget = z.object({
  sets: z.number().int().positive(),
  reps: z.union([z.number().int().positive(), z.tuple([z.number(), z.number()])]),
  loadKg: z.number().nonnegative().nullable(),
  rir: z.number().min(0).max(5).nullable(),
  restSec: z.number().int().positive().nullable(),
})
const CardioTarget = z.object({
  durationMin: z.number(),
  intensity: z.enum(['easy', 'moderate', 'hard']),
  distanceKm: z.number().nullable(),
})
const HIITTarget = z.object({
  rounds: z.number().int(),
  workSec: z.number().int(),
  restSec: z.number().int(),
  modality: z.string(),
})
const CrossfitTarget = z.object({
  format: z.enum(['AMRAP', 'ForTime', 'EMOM']),
  durationMin: z.number(),
  components: z.array(z.string()),
})
const RehabTarget = z.object({
  sets: z.number().int(),
  reps: z.number().int(),
  painCeiling: z.number().max(3),
  tempo: z.string().nullable(),
})

const Exercise = z.discriminatedUnion('type', [
  z.object({ type: z.literal('strength'), name: z.string(), targets: StrengthTarget }),
  z.object({ type: z.literal('cardio'), name: z.string(), targets: CardioTarget }),
  z.object({ type: z.literal('hiit'), name: z.string(), targets: HIITTarget }),
  z.object({ type: z.literal('crossfit'), name: z.string(), targets: CrossfitTarget }),
  z.object({ type: z.literal('rehab'), name: z.string(), targets: RehabTarget }),
])

const SessionPlan = z.object({ exercises: z.array(Exercise) })

const InputSchema = z.object({
  modality: z.enum(['strength', 'cardio', 'hiit', 'crossfit', 'rehab']),
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
      message: 'Unauthorized'
    })
  }

  // Parse and validate request body
  const body = await readBody(event)
  const parsed = InputSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      message: 'Invalid input',
      data: parsed.error.flatten()
    })
  }

  // Connect to database
  const config = useRuntimeConfig()
  const connectionString = config.databaseUrl
  if (!connectionString) {
    throw createError({
      statusCode: 500,
      message: 'Database configuration missing'
    })
  }

  const pg = postgres(connectionString)
  const db = drizzle(pg)

  try {
    // Fetch user profile
    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, user.sub))
      .limit(1)

    if (!profile) {
      throw createError({
        statusCode: 404,
        message: 'User profile not found. Please complete onboarding first.'
      })
    }

    // Map profile to AI format
    const userProfile = {
      experience: profile.experienceLevel || 'beginner',
      units: profile.units || 'metric',
      equipment: [], // TODO: Add equipment field to profile schema
      goals: profile.goals || 'general_strength'
    }

    // Build AI prompts
    const systemPrompt = `You are an expert fitness coach and workout session designer.

CRITICAL REQUIREMENTS:
- Generate a workout session that fits within the specified time limit
- Return ONLY valid JSON matching the exact schema
- Each exercise must have the correct type and targets structure
- Consider warm-up, work sets, and rest periods when calculating total time
- For beginners, use fewer exercises with more rest time

EXERCISE TYPES:
- "strength": Use targets { sets, reps, loadKg, rir, restSec }
- "cardio": Use targets { durationMin, intensity: "easy"|"moderate"|"hard", distanceKm }
- "hiit": Use targets { rounds, workSec, restSec, modality }
- "crossfit": Use targets { format: "AMRAP"|"ForTime"|"EMOM", durationMin, components: [] }
- "rehab": Use targets { sets, reps, painCeiling, tempo }

TIME CALCULATION GUIDELINES:
- Strength: ~2-3 min per set (including rest), so 3 sets = ~8 min per exercise
- Cardio: Use durationMin directly
- HIIT: (workSec + restSec) * rounds / 60 = total minutes
- Add 5-10 min for warm-up and cool-down

Respond with valid JSON only.`

    const userPrompt = `Generate a ${parsed.data.modality} workout session for ${parsed.data.sessionLengthMin} minutes.
User: ${userProfile.experience} level, ${userProfile.units} units.
Goals: ${userProfile.goals}.

IMPORTANT: The TOTAL session must fit in ${parsed.data.sessionLengthMin} minutes including warm-up and rest.
For ${userProfile.experience} level, use appropriate exercise count and rest periods.
`

    // Call AI service with structured outputs
    const aiResponse = await callCloudflareAI({
      systemPrompt,
      userPrompt,
      temperature: 0.5,
      maxRetries: 2,
      responseSchema: SessionPlan,
      schemaName: 'session_plan',
    })

    if (!aiResponse.success || !aiResponse.data) {
      throw createError({
        statusCode: 500,
        message: aiResponse.error || 'Failed to generate session'
      })
    }

    console.log('[AI Session] AI response data type:', typeof aiResponse.data)
    console.log('[AI Session] AI response data:', JSON.stringify(aiResponse.data).substring(0, 200))

    // Handle case where AI might return array directly instead of wrapped in object
    let sessionData = aiResponse.data
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
        data: result.error.flatten()
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
      message: error.message || 'Failed to generate session'
    })
  } finally {
    await pg.end()
  }
})
