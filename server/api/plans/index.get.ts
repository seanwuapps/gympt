import { serverSupabaseUser } from '#supabase/server'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { eq, desc } from 'drizzle-orm'
import { trainingPlans } from '../../../db/schema'

/**
 * GET /api/plans
 * Fetch all training plans for the authenticated user
 */
export default defineEventHandler(async (event) => {
  // Get authenticated user
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized'
    })
  }

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
    // Fetch all plans for user, ordered by active first, then by creation date
    const plans = await db
      .select()
      .from(trainingPlans)
      .where(eq(trainingPlans.userId, user.sub))
      .orderBy(desc(trainingPlans.isActive), desc(trainingPlans.createdAt))

    return {
      success: true,
      plans
    }
  } catch (error: any) {
    console.error('Error fetching plans:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch training plans'
    })
  } finally {
    await pg.end()
  }
})
