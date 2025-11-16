import { z } from 'zod'

/**
 * Day plan with modality and optional focus
 */
export const DayPlanSchema = z.object({
  modality: z.enum(['strength', 'cardio', 'hiit', 'crossfit', 'rehab', 'rest']),
  focus: z.string().max(50).optional(), // e.g., "chest", "back", "legs" for strength; "running", "cycling" for cardio
})

/**
 * Schema for validating AI-generated training plan responses
 */
export const TrainingPlanAIResponseSchema = z.object({
  name: z.string().min(1).max(100),
  duration_weeks: z.number().int().min(4).max(16),
  weekly_schedule: z.record(
    z.string().regex(/^week\d+$/), // week1, week2, etc.
    z.record(
      z.enum(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']),
      z.union([
        DayPlanSchema,
        // Support string for backward compatibility (will be converted to DayPlanSchema)
        z.string().min(1).max(50)
      ])
    )
  )
})

export type TrainingPlanAIResponse = z.infer<typeof TrainingPlanAIResponseSchema>

/**
 * Schema for plan generation request
 */
export const GeneratePlanRequestSchema = z.object({
  userId: z.string().uuid().optional(), // Optional, will use auth.uid() if not provided
})

export type GeneratePlanRequest = z.infer<typeof GeneratePlanRequestSchema>
