/**
 * Centralized AI prompts for training plan generation
 * All plan-related prompts are defined here for easy maintenance and reuse
 */

import type { Profile } from '../../../db/schema'

export interface PlanGenerationInput {
  profile: Profile
}

/**
 * Generates the system prompt for training plan generation
 */
export function getTrainingPlanSystemPrompt(): string {
  return `You are an expert fitness coach and training program designer. Your role is to create personalized, high-level training plans based on user profiles.

CRITICAL REQUIREMENTS:
- Generate ONLY high-level training plans (day-to-modality mapping)
- DO NOT include specific exercises, sets, reps, or weights
- Plans should map training days to modalities/focus areas (e.g., "Chest", "Back+Cardio", "Rest")
- Determine appropriate plan duration based on user's fitness level and goals
- Consider user's experience level, goals, available training days, equipment, and injury flags
- Support mixed modalities per day (e.g., "Legs+Core", "Upper Body+Cardio")
- Ensure progressive overload principles and adequate recovery

OUTPUT FORMAT:
Return a JSON object with this exact structure:
{
  "name": "Descriptive plan name",
  "duration_weeks": <number between 4-16>,
  "weekly_schedule": {
    "week1": {
      "Mon": "Training focus or Rest",
      "Tue": "Training focus or Rest",
      ...
    },
    "week2": { ... },
    ...
  }
}

MODALITY TYPES (use ONLY these exact single values):
- "strength" - any resistance/weight training (chest, back, legs, arms, full body, etc.)
- "cardio" - cardiovascular endurance training (running, cycling, swimming, etc.)
- "hiit" - high-intensity interval training
- "crossfit" - functional fitness workouts
- "rehab" - recovery, mobility, or rehabilitation work
- "rest" - complete rest day

CRITICAL: 
- Use ONLY ONE modality per day (no mixed modalities like "hiit+strength" or "cardio+strength")
- For any strength-based workout (chest, back, legs, push, pull, upper, lower, full body), use "strength"
- Do NOT combine modalities with "+" or any other separator

Respond ONLY with valid JSON, no additional text.`
}

/**
 * Generates the user prompt for training plan generation
 */
export function getTrainingPlanUserPrompt(input: PlanGenerationInput): string {
  const { profile } = input

  const goals = profile.goals || 'general fitness'
  const experience = profile.experienceLevel
  const trainingDays = profile.preferredTrainingDays as string[]
  const injuries = profile.injuryFlags || 'none'
  const aggressiveness = profile.aggressiveness

  return `Create a personalized training plan with the following parameters:

USER PROFILE:
- Goals: ${goals}
- Experience Level: ${experience}
- Preferred Training Days: ${trainingDays.join(', ')}
- Injury Flags: ${injuries}
- Progression Pace: ${aggressiveness}
- Units: ${profile.units}

REQUIREMENTS:
1. Determine optimal plan duration (4-16 weeks) based on goals and experience
2. Map each preferred training day to ONE single modality (strength, cardio, hiit, crossfit, rehab, or rest)
3. Include rest days on non-training days
4. Ensure balanced programming with adequate recovery
5. Consider injury flags when assigning training focus
6. DO NOT use mixed modalities - use only ONE modality per day

Generate the training plan now.`
}

/**
 * Validates and formats the AI response
 */
export function formatPlanName(goals: string, experience: string): string {
  const goalParts = goals.split(',').map(g => g.trim())
  const primaryGoal = goalParts[0] || 'Fitness'
  
  return `${experience.charAt(0).toUpperCase() + experience.slice(1)} ${primaryGoal} Plan`
}
