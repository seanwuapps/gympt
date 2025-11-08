import { defineEventHandler, getRouterParam, createError } from 'h3'
import { serverSupabaseUser } from '#supabase/server'
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
    // Fetch session (RLS ensures user can only access their own)
    const result = await db
      .select()
      .from(sessions)
      .where(and(
        eq(sessions.id, sessionId),
        eq(sessions.userId, user.sub)
      ))
      .limit(1)

    if (result.length === 0) {
      throw createError({
        statusCode: 404,
        message: 'Session not found'
      })
    }

    return {
      success: true,
      session: result[0]
    }
  } finally {
    await client.end()
  }
})
