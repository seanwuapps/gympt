import { z } from 'zod'

/**
 * Schema for a single day suggestion
 */
export const DaySuggestionSchema = z.object({
  modality: z.string().min(1).max(50),
  rationale: z.string().min(10).max(200),
  icon: z.string().min(1).max(10), // Emoji or icon identifier
})

/**
 * Schema for validating AI-generated day suggestion responses
 */
export const DaySuggestionResponseSchema = z.object({
  suggestions: z.array(DaySuggestionSchema).length(3), // Exactly 3 suggestions
})

export type DaySuggestion = z.infer<typeof DaySuggestionSchema>
export type DaySuggestionResponse = z.infer<typeof DaySuggestionResponseSchema>
