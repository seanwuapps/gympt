/**
 * Centralized AI prompts for training plan day suggestions
 */

import type { Profile, TrainingPlan } from '../../../db/schema'

export interface DaySuggestionInput {
  profile: Profile
  plan: TrainingPlan
  week: string
  day: string
  currentModality: string
  weekSchedule: Record<string, string>
}

/**
 * Generates the system prompt for day suggestions
 */
export function getDaySuggestionSystemPrompt(): string {
  return `You are an expert fitness coach helping users adjust their training plans intelligently.

CRITICAL REQUIREMENTS:
- Generate EXACTLY 3 alternative workout options for the specified day
- Each suggestion must include: modality, rationale (MAX 150 characters), and an emoji icon
- Rationale MUST be concise - under 150 characters, ideally 1 sentence
- Suggestions should be contextually appropriate based on the week's schedule
- Consider recovery, muscle group balance, and training frequency
- Avoid overtraining patterns (max 5-6 training days per week)
- Ensure adequate recovery between similar muscle groups (48-72 hours)

SUGGESTION STRATEGY:
1. Option 1: Similar alternative (e.g., different strength focus)
2. Option 2: Recovery-focused (e.g., "rest" or "rehab")
3. Option 3: Complementary workout (e.g., different modality type)

VALID MODALITY TYPES (use these exact values):
- "strength" - any resistance/weight training
- "cardio" - cardiovascular endurance training
- "hiit" - high-intensity interval training
- "crossfit" - functional fitness workouts
- "rehab" - recovery, mobility, or rehabilitation work
- "rest" - complete rest day

IMPORTANT: Use ONLY these exact modality values. Do not use specific body part names like "Push", "Pull", "Legs", etc.

OUTPUT FORMAT:
Return a JSON object with this exact structure:
{
  "suggestions": [
    {
      "modality": "Modality name",
      "rationale": "Short explanation (max 150 chars)",
      "icon": "🏋️"
    },
    {
      "modality": "Modality name",
      "rationale": "Short explanation (max 150 chars)",
      "icon": "😴"
    },
    {
      "modality": "Modality name",
      "rationale": "Short explanation (max 150 chars)",
      "icon": "🏃"
    }
  ]
}

IMPORTANT: Keep rationales SHORT - maximum 150 characters each!
Respond ONLY with valid JSON, no additional text.`
}

/**
 * Generates the user prompt for day suggestions
 */
export function getDaySuggestionUserPrompt(input: DaySuggestionInput): string {
  const { profile, plan, week, day, currentModality, weekSchedule } = input

  // Format week schedule for display
  const scheduleLines = Object.entries(weekSchedule)
    .map(([d, modality]) => `- ${d}: ${modality}${d === day ? ' (← CURRENT)' : ''}`)
    .join('\n')

  // Extract week number
  const weekNumber = week.replace('week', '')

  return `Suggest 3 alternative workout options for this day in the user's training plan.

USER PROFILE:
- Goals: ${profile.goals || 'general fitness'}
- Experience Level: ${profile.experienceLevel}
- Progression Pace: ${profile.aggressiveness}

CURRENT PLAN:
- Plan Name: ${plan.name}
- Duration: ${plan.durationWeeks} weeks
- Current Week: ${weekNumber} of ${plan.durationWeeks}

THIS WEEK'S SCHEDULE:
${scheduleLines}

DAY TO MODIFY: ${day} (currently: ${currentModality})

REQUIREMENTS:
1. Provide 3 diverse suggestions that make sense in context of the week
2. Option 1: Similar alternative to current modality
3. Option 2: Recovery-focused option (Rest or light activity)
4. Option 3: Complementary workout (different muscle group or training type)
5. Each rationale MUST be under 150 characters - be concise!
6. Avoid creating overtraining patterns
7. Consider muscle group recovery (48-72 hours between similar groups)
8. Include appropriate emoji icons for each suggestion

CRITICAL: Keep each rationale SHORT (max 150 characters). Generate the 3 suggestions now.`
}
