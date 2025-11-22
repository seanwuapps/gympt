import { serverSupabaseUser } from '#supabase/server'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { eq, and } from 'drizzle-orm'
import { trainingPlans, profiles } from '../../../../db/schema'
import { DaySuggestionResponseSchema } from '../../../shared/schemas/day-suggestion'
import {
  getDaySuggestionSystemPrompt,
  getDaySuggestionUserPrompt,
} from '../../../shared/prompts/day-suggestions'

/**
 * POST /api/plans/:id/suggest-day
 * Generate AI-powered suggestions for modifying a specific day in a training plan
 */
export default defineEventHandler(async (event) => {
  // Get authenticated user
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }

  const planId = getRouterParam(event, 'id')

  if (!planId) {
    throw createError({
      statusCode: 400,
      message: 'Plan ID is required',
    })
  }

  const body = await readBody(event)
  const { week, day } = body

  // Validate request body
  if (!week || !day) {
    throw createError({
      statusCode: 400,
      message: 'Week and day are required',
    })
  }

  if (!week.match(/^week\d+$/)) {
    throw createError({
      statusCode: 400,
      message: 'Invalid week format. Expected format: week1, week2, etc.',
    })
  }

  const validDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  if (!validDays.includes(day)) {
    throw createError({
      statusCode: 400,
      message: `Invalid day. Must be one of: ${validDays.join(', ')}`,
    })
  }

  const config = useRuntimeConfig()
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
    // Fetch the training plan
    const [plan] = await db
      .select()
      .from(trainingPlans)
      .where(and(eq(trainingPlans.id, planId), eq(trainingPlans.userId, user.sub)))
      .limit(1)

    if (!plan) {
      throw createError({
        statusCode: 404,
        message: 'Training plan not found',
      })
    }

    // Fetch user profile
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, user.sub)).limit(1)

    if (!profile) {
      throw createError({
        statusCode: 404,
        message: 'User profile not found',
      })
    }

    // Extract week schedule
    const weeklySchedule = plan.weeklySchedule as Record<
      string,
      Record<string, string | { modality: string }>
    >
    const rawWeekSchedule = weeklySchedule[week]

    if (!rawWeekSchedule) {
      throw createError({
        statusCode: 404,
        message: `Week ${week} not found in plan`,
      })
    }

    // Normalize week schedule for prompt (convert objects to strings)
    const weekSchedule: Record<string, string> = Object.entries(rawWeekSchedule).reduce(
      (acc, [d, val]) => {
        acc[d] = typeof val === 'string' ? val : val.modality
        return acc
      },
      {} as Record<string, string>
    )

    const currentModality = weekSchedule[day]

    if (!currentModality) {
      throw createError({
        statusCode: 404,
        message: `Day ${day} not found in ${week}`,
      })
    }

    // Generate AI prompts
    const systemPrompt = getDaySuggestionSystemPrompt()
    const userPrompt = getDaySuggestionUserPrompt({
      profile,
      plan,
      week,
      day,
      currentModality,
      weekSchedule,
    })

    // Call AI service with structured outputs and 10s timeout
    const aiResponse = await Promise.race([
      callCloudflareAI({
        systemPrompt,
        userPrompt,
        temperature: 0.7,
        maxRetries: 2, // Fewer retries for faster response
        responseSchema: DaySuggestionResponseSchema,
        schemaName: 'day_suggestions',
      }),
      new Promise<{ success: false; error: string }>((resolve) =>
        setTimeout(() => resolve({ success: false, error: 'AI request timed out' }), 10000)
      ),
    ])

    if (!aiResponse.success || !aiResponse.data) {
      console.error('AI suggestion generation failed:', aiResponse.error)
      throw createError({
        statusCode: 500,
        message: aiResponse.error || 'Failed to generate suggestions',
      })
    }

    // Validate AI response with Zod
    let validationResult = DaySuggestionResponseSchema.safeParse(aiResponse.data)

    // If validation fails due to long rationales, try truncating them
    if (!validationResult.success && aiResponse.data?.suggestions) {
      console.warn('AI response validation failed, attempting to truncate rationales')
      const truncatedData = {
        suggestions: aiResponse.data.suggestions.map((s: any) => ({
          modality: s.modality?.substring(0, 50) || 'Full Body',
          rationale: s.rationale?.substring(0, 200) || 'Alternative workout option',
          icon: s.icon?.substring(0, 10) || '🏋️',
        })),
      }
      validationResult = DaySuggestionResponseSchema.safeParse(truncatedData)
    }

    if (!validationResult.success) {
      console.error('AI response validation failed:', validationResult.error)
      console.error('AI response data:', JSON.stringify(aiResponse.data, null, 2))
      throw createError({
        statusCode: 500,
        message: 'Invalid suggestions generated. Please try manual selection.',
      })
    }

    return {
      success: true,
      suggestions: validationResult.data.suggestions,
    }
  } catch (error: any) {
    console.error('Day suggestion error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to generate day suggestions',
    })
  } finally {
    await pg.end()
  }
})
