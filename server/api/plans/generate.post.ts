import { serverSupabaseUser } from '#supabase/server'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { eq } from 'drizzle-orm'
import { profiles, trainingPlans } from '../../../db/schema'
import {
  TrainingPlanAIResponseSchema,
  type TrainingPlanAIResponse,
} from '../../shared/schemas/training-plan'
import {
  getTrainingPlanSystemPrompt,
  getTrainingPlanUserPrompt,
  getRehabPlanSystemPrompt,
  getRehabPlanUserPrompt,
} from '../../shared/prompts/plans'

export default defineEventHandler(async (event) => {
  // Get authenticated user
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }

  const config = useRuntimeConfig()
  console.log({ config })
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

    // Get plan type from request body (default to normal)
    const body = await readBody(event)
    const planType: 'normal' | 'rehab' = body?.planType || 'normal'

    // Generate AI prompts based on plan type
    const systemPrompt =
      planType === 'rehab' ? getRehabPlanSystemPrompt() : getTrainingPlanSystemPrompt()
    console.log({ planType, systemPrompt })

    const userPrompt =
      planType === 'rehab'
        ? getRehabPlanUserPrompt({ profile })
        : getTrainingPlanUserPrompt({ profile })
    console.log({ userPrompt })

    // Call AI service with structured outputs
    const aiResponse = await callCloudflareAI({
      systemPrompt,
      userPrompt,
      temperature: 0.7,
      maxRetries: 3,
      responseSchema: TrainingPlanAIResponseSchema,
      schemaName: 'training_plan',
    })

    if (!aiResponse.success || !aiResponse.data) {
      throw createError({
        statusCode: 500,
        message: aiResponse.error || 'Failed to generate training plan',
      })
    }

    // AI service now handles validation and retries
    const planData = aiResponse.data as TrainingPlanAIResponse

    // Convert string modalities to DayPlan objects for backward compatibility
    const weeklySchedule = Object.entries(planData.weekly_schedule).reduce(
      (acc, [week, days]) => {
        acc[week] = Object.entries(days).reduce(
          (dayAcc, [day, value]) => {
            if (typeof value === 'string') {
              // Convert legacy string format to DayPlan object
              dayAcc[day] = { modality: value as any }
            } else {
              dayAcc[day] = value
            }
            return dayAcc
          },
          {} as Record<string, any>
        )
        return acc
      },
      {} as Record<string, Record<string, any>>
    )

    // Store plan in database
    const [newPlan] = await db
      .insert(trainingPlans)
      .values({
        userId: user.sub,
        name: planData.name,
        durationWeeks: planData.duration_weeks,
        weeklySchedule,
        isActive: false, // User must explicitly activate
      })
      .returning()

    return {
      success: true,
      plan: newPlan,
    }
  } catch (error: any) {
    console.error('Plan generation error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to generate training plan',
    })
  } finally {
    await pg.end()
  }
})
