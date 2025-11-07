import { serverSupabaseUser } from '#supabase/server'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { eq, and } from 'drizzle-orm'
import { trainingPlans } from '../../../db/schema'

/**
 * DELETE /api/plans/:id
 * Delete a training plan
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
    // Check if plan exists and belongs to user
    const [existingPlan] = await db
      .select()
      .from(trainingPlans)
      .where(and(
        eq(trainingPlans.id, planId),
        eq(trainingPlans.userId, user.sub)
      ))
      .limit(1)

    if (!existingPlan) {
      throw createError({
        statusCode: 404,
        message: 'Training plan not found'
      })
    }

    // Prevent deletion of active plan without explicit confirmation
    if (existingPlan.isActive) {
      throw createError({
        statusCode: 400,
        message: 'Cannot delete active plan. Please set another plan as active first.'
      })
    }

    // Delete the plan
    await db
      .delete(trainingPlans)
      .where(and(
        eq(trainingPlans.id, planId),
        eq(trainingPlans.userId, user.sub)
      ))

    return {
      success: true,
      message: 'Training plan deleted successfully'
    }
  } catch (error: any) {
    console.error('Error deleting plan:', error)
    
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: 'Failed to delete training plan'
    })
  } finally {
    await pg.end()
  }
})
