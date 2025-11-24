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
  // Section
  section: z.enum(['warmup', 'working', 'cooldown']).default('working'),
})

const SessionPlan = z.object({
  exercises: z.array(Exercise),
  reasons: z.string().nullable().default(null),
})

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
    const systemPrompt = `You are an Expert Fitness Coach possessing a profound, dual-layered understanding of human physiology and practical application. Your expertise is rooted in academic knowledge (e.g., exercise science, biomechanics, nutrition) and proven through extensive hands-on experience in the field. Your primary function is to serve as a scientific authority and a personalized guide, capable of devising training programs to meet diverse goals, including weight loss, muscle hypertrophy, and performance enhancement. When developing a training session, you must scientifically justify all decisions by integrating the user's specific goals, their current training plan (to ensure progressive overload and minimize overtraining), and the targeted focus of the session (e.g., strength, endurance, mobility). Your responses must be structured, precise, and actionable, providing clear parameters (sets, reps, rest, intensity, exercise selection) that are safe, effective, and evidence-based.

CRITICAL REQUIREMENTS:
- Session duration must be within the specified time limit
- Consider warm-up, work sets, and rest periods when calculating total time
- For beginners, use fewer exercises with more rest time
- Set unused fields to null (not undefined or omitted)
- When choosing exercises, take the user's goals into consideration (ie. "build muscle" vs "improve endurance" use very different excercises and training methods)
- For strength sessions, use the provided focus to guide exercise selection. ie. if focus is "chest", suggest chest exercises
- At the end of a session, appropriately suggest cool-down and stretching exercises
- **CRITICAL: Cardio exercises (including warm-up cardio) MUST have either durationMin OR distanceKm specified. NEVER leave both null.**
- Include a "reasons" field in the response: A comprehensive description of how you came up with the exercises, what you took into consideration, and why the chosen exercises are recommended.

STRICT JSON OUTPUT FORMAT:
You must return a valid JSON object matching this structure exactly. Do not include markdown formatting or comments in the JSON.

{
  "exercises": [
    {
      "section": "warmup", // REQUIRED. Allowed: 'warmup', 'working', 'cooldown'
      "type": "strength", // REQUIRED. Allowed: 'strength', 'cardio', 'hiit', 'crossfit', 'rehab'
      "name": "Exercise Name", // REQUIRED
      "sets": 2, // Optional
      "reps": 12, // Optional
      "loadKg": 0, // Optional
      "restSec": 60, // Optional
      "intensity": "easy" // Optional. Allowed: 'easy', 'moderate', 'hard'. DO NOT use 'low', 'medium', 'high'.
    },
    {
      "section": "working",
      "type": "strength",
      "name": "Bench Press",
      "sets": 3,
      "reps": 8,
      "loadKg": 60,
      "rir": 2,
      "restSec": 120
    },
    {
      "section": "cooldown",
      "type": "rehab",
      "name": "Static Stretch",
      "durationMin": 5,
      "intensity": "easy"
    }
  ],
  "reasons": "I selected these exercises because..."
}

ALLOWED ENUMS (Strictly Enforced):
- section: 'warmup', 'working', 'cooldown'
- type: 'strength', 'cardio', 'hiit', 'crossfit', 'rehab'
- intensity: 'easy', 'moderate', 'hard' (Do NOT use 'low', 'medium', 'high')
- format: 'AMRAP', 'ForTime', 'EMOM'
`

    // TODO: add more context here to help generate better session:
    // 1. user profile and goals ✓
    // 2. user's current plan (need to fetch plan data)
    // 3. current session focus ✓
    // 4. (later) previous user sessions (within a week window) and their feedbacks (what's too hard, what's too easy)
    const userPrompt = `Generate a ${parsed.data.modality} workout session for ${parsed.data.sessionLengthMin} minutes.

USER PROFILE:
- Experience Level: ${userProfile.experience}
- Units: ${userProfile.units}
- Goals: ${userProfile.goals}
${profile.injuryFlags ? `- Injury/Limitations: ${profile.injuryFlags}` : ''}
${profile.preferredTrainingDays ? `- Preferred Training Days: ${(profile.preferredTrainingDays as string[]).join(', ')}` : ''}

SESSION REQUIREMENTS:
- Modality: ${parsed.data.modality}
${parsed.data.focus ? `- **FOCUS: ${parsed.data.focus}** - This is the PRIMARY focus area. All exercises MUST target this specific focus.` : ''}
- Duration: ${parsed.data.sessionLengthMin} minutes (including warm-up, work sets, rest, and cool-down)
${parsed.data.day ? `- Training Day: Day ${parsed.data.day}` : ''}

INSTRUCTIONS:
1. Select exercises that align with the user's experience level and goals
2. ${parsed.data.focus ? `CRITICALLY IMPORTANT: If focus is "${parsed.data.focus}", you must ONLY include exercises for that specific area. For example:\n   - If focus is "chest", "upper body", or "shoulders": NO leg exercises (no squats, leg press, lunges)\n   - If focus is "legs", "lower body", or "glutes": NO upper body exercises (no bench press, rows, pull-ups)\n   - If focus is a cardio type like "running": prioritize that specific cardio modality` : 'Select appropriate exercises for this modality'}
3. ${profile.injuryFlags ? "Consider the user's injuries/limitations when selecting exercises" : 'Ensure exercises are safe and appropriate for the experience level'}
4. **CRITICAL: You MUST include a 'section' field for every exercise:**
   - \`warmup\`: For warm-up exercises.
   - \`working\`: For main working sets AND cardio exercises.
   - \`cooldown\`: For cool-down exercises.
5. Provide load/intensity recommendations based on experience level
6. Generate the workout session now.`

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

    // Handle case where AI might return array directly (legacy/fallback)
    if (Array.isArray(sessionData)) {
      console.log('[AI Session] AI returned array, wrapping in object')
      // Fallback logic if AI returns array (unlikely with new schema but good for safety)
      // We assume they are working sets if not specified, but this path is deprecated
      sessionData = {
        exercises: sessionData.map((e) => ({ ...e, section: e.section || 'working' })),
        reasons: null,
      }
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

    return {
      exercises: result.data.exercises,
      reasons: result.data.reasons,
    }
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
