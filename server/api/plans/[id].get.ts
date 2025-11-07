import { serverSupabaseUser } from '#supabase/server'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { eq, and } from 'drizzle-orm'
import { trainingPlans } from '../../../db/schema'

/**
 * GET /api/plans/:id
 * Fetch a single training plan by ID
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

  const planId = getRouterParam(event, 'id')

  if (!planId) {
    throw createError({
      statusCode: 400,
      message: 'Plan ID is required'
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
    // Fetch plan, ensuring it belongs to the user (RLS enforcement)
    const [plan] = await db
      .select()
      .from(trainingPlans)
      .where(and(
        eq(trainingPlans.id, planId),
        eq(trainingPlans.userId, user.sub)
      ))
      .limit(1)

    if (!plan) {
      throw createError({
        statusCode: 404,
        message: 'Training plan not found'
      })
    }

    return {
      success: true,
      plan
    }
  } catch (error: any) {
    console.error('Error fetching plan:', error)
    
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: 'Failed to fetch training plan'
    })
  } finally {
    await pg.end()
  }
})
