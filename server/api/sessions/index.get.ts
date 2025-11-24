import { defineEventHandler, getQuery, createError } from 'h3'
import { serverSupabaseUser } from '#supabase/server'
import { ListSessionsQuerySchema } from '../../shared/schemas/session'
import { sessions } from '../../../db/schema'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { eq, and, desc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  // Get authenticated user
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }

  // Parse and validate query params
  const query = getQuery(event)
  const validation = ListSessionsQuerySchema.safeParse(query)

  if (!validation.success) {
    throw createError({
      statusCode: 400,
      message: 'Invalid query parameters',
      data: validation.error.flatten(),
    })
  }

  const { status, planId, week, dayKey, limit, offset } = validation.data

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
    // Build where conditions
    const conditions = [eq(sessions.userId, user.sub)]
    if (status) {
      conditions.push(eq(sessions.status, status))
    }
    if (planId) {
      conditions.push(eq(sessions.planId, planId))
    }
    if (week) {
      conditions.push(eq(sessions.week, week))
    }
    if (dayKey) {
      conditions.push(eq(sessions.dayKey, dayKey))
    }

    // Fetch sessions
    const result = await db
      .select()
      .from(sessions)
      .where(and(...conditions))
      .orderBy(desc(sessions.createdAt))
      .limit(limit)
      .offset(offset)

    return {
      success: true,
      sessions: result,
      count: result.length,
    }
  } finally {
    await client.end()
  }
})
