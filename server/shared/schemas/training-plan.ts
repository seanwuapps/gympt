import { z } from 'zod'

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
      z.string().min(1).max(50) // modality or "Rest"
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
