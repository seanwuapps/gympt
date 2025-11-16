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
- Generate ONLY high-level training plans (day-to-modality mapping with focus areas)
- DO NOT include specific exercises, sets, reps, or weights
- Plans should map training days to modalities with optional focus
- For strength days, ALWAYS include a focus (e.g., chest, back, legs, arms, shoulders, full_body, push, pull, upper, lower)
- For cardio days, optionally include a focus (e.g., running, cycling, swimming, rowing)
- Determine appropriate plan duration based on user's fitness level and goals
- Consider user's experience level, goals, available training days, equipment, and injury flags
- Ensure progressive overload principles and adequate recovery

OUTPUT FORMAT:
Return a JSON object with this exact structure:
{
  "name": "Descriptive plan name",
  "duration_weeks": <number between 4-16>,
  "weekly_schedule": {
    "week1": {
      "Mon": { "modality": "strength", "focus": "chest" },
      "Tue": { "modality": "rest" },
      "Wed": { "modality": "cardio", "focus": "running" },
      ...
    },
    "week2": { ... },
    ...
  }
}

MODALITY TYPES (use ONLY these exact values):
- "strength" - any resistance/weight training (MUST include focus: chest, back, legs, arms, shoulders, full_body, push, pull, upper, lower, etc.)
- "cardio" - cardiovascular endurance training (optional focus: running, cycling, swimming, rowing, etc.)
- "hiit" - high-intensity interval training (no focus needed)
- "crossfit" - functional fitness workouts (no focus needed)
- "rehab" - recovery, mobility, or rehabilitation work (no focus needed)
- "rest" - complete rest day (no focus needed)

FOCUS OPTIONS:

STRENGTH FOCUS:
- "chest" - chest-focused strength work
- "back" - back-focused strength work
- "legs" - leg-focused strength work
- "arms" - arm-focused strength work
- "shoulders" - shoulder-focused strength work
- "full_body" - full body strength work
- "push" - push-focused strength work (chest, shoulders, triceps)
- "pull" - pull-focused strength work (back, biceps)
- "upper" - upper body strength work
- "lower" - lower body strength work
- "core" - core-focused strength work
- "glutes" - glute-focused strength work

CARDIO FOCUS (optional):
- "running" - running/jogging cardio
- "cycling" - cycling/stationary bike cardio
- "swimming" - swimming cardio
- "rowing" - rowing cardio
- "jumping_rope" - jumping rope cardio
- "elliptical" - elliptical cardio
- "mixed" - mixed modality cardio

CRITICAL: 
- Every strength day MUST have a focus
- Cardio/HIIT/Crossfit/Rehab days do NOT need focus (but cardio can have optional focus)
- Rest days should be: { "modality": "rest" }
- Do NOT use strings for days - ALWAYS return objects with "modality" and optional "focus"

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
2. Map each preferred training day to ONE modality with appropriate focus for strength and cardio days
3. Include rest days on non-training days
4. Ensure balanced programming with adequate recovery and variety in focus areas
5. Consider injury flags when assigning training focus
6. For each strength day, choose an appropriate focus (chest, back, legs, arms, shoulders, full_body, push, pull, upper, lower, core, glutes)
7. For cardio days, optionally choose a focus (running, cycling, swimming, rowing, etc.)
8. Return each day as an object with "modality" and optional "focus"

RESPONSE FORMAT REMINDER:
- Each day must be an object: { "modality": "strength", "focus": "chest" }
- Rest days: { "modality": "rest" }
- Cardio can have optional focus: { "modality": "cardio", "focus": "running" } or { "modality": "cardio" }
- Never use strings like "chest" or "strength" alone - always use objects

Generate the training plan now.`
}

/**
 * Validates and formats the AI response
 */
export function formatPlanName(goals: string, experience: string): string {
  const goalParts = goals.split(',').map((g) => g.trim())
  const primaryGoal = goalParts[0] || 'Fitness'

  return `${experience.charAt(0).toUpperCase() + experience.slice(1)} ${primaryGoal} Plan`
}
