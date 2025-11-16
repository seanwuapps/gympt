import { serverSupabaseUser } from '#supabase/server'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { eq, and } from 'drizzle-orm'
import { trainingPlans } from '../../../db/schema'

/**
 * PATCH /api/plans/:id
 * Update a training plan (primarily for setting active status)
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

  const body = await readBody(event)
  const { isActive, week, day, modality, focus } = body

  // Validate request - either isActive or weeklySchedule update
  const isActivatingPlan = typeof isActive === 'boolean'
  const isUpdatingSchedule = week && day && modality

  if (!isActivatingPlan && !isUpdatingSchedule) {
    throw createError({
      statusCode: 400,
      message: 'Either isActive or (week, day, modality) must be provided'
    })
  }

  if (isActivatingPlan && isUpdatingSchedule) {
    throw createError({
      statusCode: 400,
      message: 'Cannot update isActive and weeklySchedule in the same request'
    })
  }

  // Validate weeklySchedule update parameters
  if (isUpdatingSchedule) {
    if (!week.match(/^week\d+$/)) {
      throw createError({
        statusCode: 400,
        message: 'Invalid week format. Expected format: week1, week2, etc.'
      })
    }

    const validDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    if (!validDays.includes(day)) {
      throw createError({
        statusCode: 400,
        message: `Invalid day. Must be one of: ${validDays.join(', ')}`
      })
    }

    if (typeof modality !== 'string' || modality.trim().length === 0) {
      throw createError({
        statusCode: 400,
        message: 'Modality must be a non-empty string'
      })
    }

    // Validate modality is one of the valid types
    const validModalities = ['strength', 'cardio', 'hiit', 'crossfit', 'rehab', 'rest']
    if (!validModalities.includes(modality.toLowerCase())) {
      throw createError({
        statusCode: 400,
        message: `Modality must be one of: ${validModalities.join(', ')}`
      })
    }
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
    if (isActivatingPlan) {
      // If setting this plan as active, deactivate all other plans first
      if (isActive) {
        await db
          .update(trainingPlans)
          .set({ isActive: false, updatedAt: new Date() })
          .where(eq(trainingPlans.userId, user.sub))
      }

      // Update the target plan
      const [updatedPlan] = await db
        .update(trainingPlans)
        .set({ isActive, updatedAt: new Date() })
        .where(and(
          eq(trainingPlans.id, planId),
          eq(trainingPlans.userId, user.sub)
        ))
        .returning()

      if (!updatedPlan) {
        throw createError({
          statusCode: 404,
          message: 'Training plan not found'
        })
      }

      return {
        success: true,
        plan: updatedPlan
      }
    }

    if (isUpdatingSchedule) {
      // Fetch the current plan to update weeklySchedule
      const [currentPlan] = await db
        .select()
        .from(trainingPlans)
        .where(and(
          eq(trainingPlans.id, planId),
          eq(trainingPlans.userId, user.sub)
        ))
        .limit(1)

      if (!currentPlan) {
        throw createError({
          statusCode: 404,
          message: 'Training plan not found'
        })
      }

      // Deep clone and update weeklySchedule
      // Handle both old string format and new DayPlan object format
      const weeklySchedule = JSON.parse(JSON.stringify(currentPlan.weeklySchedule)) as Record<string, Record<string, any>>

      if (!weeklySchedule[week]) {
        throw createError({
          statusCode: 404,
          message: `Week ${week} not found in plan`
        })
      }

      if (!weeklySchedule[week][day]) {
        throw createError({
          statusCode: 404,
          message: `Day ${day} not found in ${week}`
        })
      }

      // Update the specific day with new DayPlan structure
      weeklySchedule[week][day] = {
        modality: modality.trim().toLowerCase(),
        ...(focus && { focus })
      }

      // Update the plan with new schedule
      const [updatedPlan] = await db
        .update(trainingPlans)
        .set({ weeklySchedule, updatedAt: new Date() })
        .where(and(
          eq(trainingPlans.id, planId),
          eq(trainingPlans.userId, user.sub)
        ))
        .returning()

      if (!updatedPlan) {
        throw createError({
          statusCode: 404,
          message: 'Training plan not found'
        })
      }

      return {
        success: true,
        plan: updatedPlan
      }
    }
  } catch (error: any) {
    console.error('Error updating plan:', error)
    
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: 'Failed to update training plan'
    })
  } finally {
    await pg.end()
  }
})
