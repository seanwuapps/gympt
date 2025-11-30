import { defineEventHandler, getRouterParam, readBody, createError } from 'h3'
import { serverSupabaseUser } from '#supabase/server'
import { UpdateSessionSchema } from '../../shared/schemas/session'
import { sessions } from '../../../db/schema'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { eq, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  // Get authenticated user
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }

  // Get session ID from route params
  const sessionId = getRouterParam(event, 'id')
  if (!sessionId) {
    throw createError({
      statusCode: 400,
      message: 'Session ID is required',
    })
  }

  // Parse and validate request body
  const body = await readBody(event)
  const validation = UpdateSessionSchema.safeParse(body)

  if (!validation.success) {
    throw createError({
      statusCode: 400,
      message: 'Invalid request body',
      data: validation.error.flatten(),
    })
  }

  const updates = validation.data

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
    // Build update object
    const updateData: any = {
      updatedAt: new Date(),
    }

    if (updates.status) {
      updateData.status = updates.status
    }
    if (updates.startedAt) {
      updateData.startedAt = new Date(updates.startedAt)
    }
    if (updates.completedAt) {
      updateData.completedAt = new Date(updates.completedAt)
    }
    if (updates.feedback) {
      updateData.feedback = updates.feedback
    }
    if (updates.loggedSets) {
      updateData.loggedSets = updates.loggedSets
    }
    if (updates.exerciseCompletions) {
      updateData.exerciseCompletions = updates.exerciseCompletions
    }

    // Update session (RLS ensures user can only update their own)
    const result = await db
      .update(sessions)
      .set(updateData)
      .where(and(eq(sessions.id, sessionId), eq(sessions.userId, user.sub)))
      .returning()

    if (result.length === 0) {
      throw createError({
        statusCode: 404,
        message: 'Session not found or update failed',
      })
    }

    return {
      success: true,
      session: result[0],
    }
  } finally {
    await client.end()
  }
})
