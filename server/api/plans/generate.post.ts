import { serverSupabaseUser } from '#supabase/server'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { eq } from 'drizzle-orm'
import { profiles, trainingPlans } from '../../../db/schema'
import { TrainingPlanAIResponseSchema } from '../../shared/schemas/training-plan'
import { getTrainingPlanSystemPrompt, getTrainingPlanUserPrompt } from '../../shared/prompts/plans'

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

    // Generate AI prompts
    const systemPrompt = getTrainingPlanSystemPrompt()
    console.log({ systemPrompt })
    const userPrompt = getTrainingPlanUserPrompt({ profile })
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

    // Validate AI response with Zod
    const validationResult = TrainingPlanAIResponseSchema.safeParse(aiResponse.data)

    if (!validationResult.success) {
      console.error('AI response validation failed:', validationResult.error)
      console.error('AI response data:', JSON.stringify(aiResponse.data, null, 2))
      throw createError({
        statusCode: 500,
        message: 'Invalid training plan generated. Please try again.',
      })
    }

    const planData = validationResult.data

    // Store plan in database
    const [newPlan] = await db
      .insert(trainingPlans)
      .values({
        userId: user.sub,
        name: planData.name,
        durationWeeks: planData.duration_weeks,
        weeklySchedule: planData.weekly_schedule,
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
