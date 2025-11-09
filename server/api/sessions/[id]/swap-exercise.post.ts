import { defineEventHandler, readBody, createError, getRouterParam } from 'h3'
import { serverSupabaseUser } from '#supabase/server'
import { sessions } from '../../../../db/schema'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { eq, and } from 'drizzle-orm'
import { z } from 'zod'
import { SessionExerciseSchema } from '../../../shared/schemas/session'

const SwapExerciseSchema = z.object({
  exerciseIndex: z.number().int().nonnegative()
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

  // Get session ID from route params
  const sessionId = getRouterParam(event, 'id')
  if (!sessionId) {
    throw createError({
      statusCode: 400,
      message: 'Session ID is required'
    })
  }

  // Parse and validate request body
  const body = await readBody(event)
  const validation = SwapExerciseSchema.safeParse(body)
  
  if (!validation.success) {
    throw createError({
      statusCode: 400,
      message: 'Invalid request body',
      data: validation.error.flatten()
    })
  }

  const { exerciseIndex } = validation.data

  // Connect to database
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw createError({
      statusCode: 500,
      message: 'Database connection not configured'
    })
  }

  const client = postgres(connectionString)
  const db = drizzle(client)

  try {
    // Fetch session and verify ownership
    const [session] = await db
      .select()
      .from(sessions)
      .where(and(
        eq(sessions.id, sessionId),
        eq(sessions.userId, user.sub)
      ))
      .limit(1)

    if (!session) {
      throw createError({
        statusCode: 404,
        message: 'Session not found'
      })
    }

    // Validate exercise index
    const exercises = session.exercises as any[]
    if (exerciseIndex < 0 || exerciseIndex >= exercises.length) {
      throw createError({
        statusCode: 400,
        message: 'Invalid exercise index'
      })
    }

    const currentExercise = exercises[exerciseIndex]

    // Generate a new exercise using AI
    const newExerciseData = await $fetch<{ exercises: any[] }>('/api/ai/session.generate', {
      method: 'POST',
      body: {
        modality: currentExercise.type,
        sessionLengthMin: 10, // Short session to get just one exercise
        constraints: {
          exerciseCount: 1,
          excludeExercises: exercises.map(e => e.name) // Avoid duplicates
        }
      }
    })

    if (!newExerciseData.exercises || newExerciseData.exercises.length === 0) {
      throw createError({
        statusCode: 500,
        message: 'Failed to generate replacement exercise'
      })
    }

    const newExercise = newExerciseData.exercises[0]

    // Validate the new exercise
    const exerciseValidation = SessionExerciseSchema.safeParse(newExercise)
    if (!exerciseValidation.success) {
      throw createError({
        statusCode: 500,
        message: 'Generated exercise is invalid',
        data: exerciseValidation.error.flatten()
      })
    }

    // Update the exercises array
    exercises[exerciseIndex] = newExercise

    // Save updated session
    await db
      .update(sessions)
      .set({
        exercises: exercises,
        updatedAt: new Date()
      })
      .where(eq(sessions.id, sessionId))

    return {
      success: true,
      exercise: newExercise
    }
  } finally {
    await client.end()
  }
})
