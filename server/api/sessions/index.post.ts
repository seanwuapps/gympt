import { defineEventHandler, readBody, createError } from 'h3'
import { serverSupabaseUser } from '#supabase/server'
import { CreateSessionSchema } from '../../shared/schemas/session'
import { sessions, trainingPlans } from '../../../db/schema'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { eq, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  // Get authenticated user (works with both real and fake auth)
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }

  // Parse and validate request body
  const body = await readBody(event)
  console.log('[Session API] Request body:', JSON.stringify(body, null, 2))

  const validation = CreateSessionSchema.safeParse(body)

  if (!validation.success) {
    console.error('[Session API] Validation failed:', validation.error.flatten())
    throw createError({
      statusCode: 400,
      message: 'Invalid request body',
      data: validation.error.flatten(),
    })
  }

  console.log('[Session API] Validation passed')

  const { planId, week, dayKey, modality, focus, exercises, status } = validation.data

  // Connect to database
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw createError({
      statusCode: 500,
      message: 'Database connection not configured',
    })
  }

  const client = postgres(connectionString)
  const db = drizzle(client)

  try {
    // Verify plan belongs to user (RLS will handle this)
    const plan = await db
      .select()
      .from(trainingPlans)
      .where(and(eq(trainingPlans.id, planId), eq(trainingPlans.userId, user.sub)))
      .limit(1)

    if (plan.length === 0) {
      throw createError({
        statusCode: 404,
        message: 'Training plan not found',
      })
    }

    // Insert session (RLS will ensure user_id matches)
    const newSession = await db
      .insert(sessions)
      .values({
        userId: user.sub,
        planId,
        week,
        dayKey,
        modality,
        exercises,
        status: status || 'generated',
      })
      .returning()

    return {
      success: true,
      session: newSession[0],
    }
  } finally {
    await client.end()
  }
})
