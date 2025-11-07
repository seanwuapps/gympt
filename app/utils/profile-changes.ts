/**
 * Utility functions for detecting and summarizing profile changes
 */

import type { Profile } from '../../db/schema'

/**
 * Detects if profile changes are significant enough to warrant plan regeneration
 */
export function detectSignificantProfileChanges(
  oldProfile: Profile,
  newProfile: Profile
): boolean {
  // Check if preferred training days changed (compare array lengths)
  const trainingDaysChanged =
    oldProfile.preferredTrainingDays.length !== newProfile.preferredTrainingDays.length

  return (
    oldProfile.goals !== newProfile.goals ||
    oldProfile.experienceLevel !== newProfile.experienceLevel ||
    trainingDaysChanged ||
    oldProfile.aggressiveness !== newProfile.aggressiveness
  )
}

/**
 * Generates a human-readable summary of profile changes
 */
export function getChangeSummary(oldProfile: Profile, newProfile: Profile): string[] {
  const changes: string[] = []

  if (oldProfile.goals !== newProfile.goals) {
    changes.push(`Goals: ${oldProfile.goals} → ${newProfile.goals}`)
  }

  if (oldProfile.experienceLevel !== newProfile.experienceLevel) {
    changes.push(`Experience: ${oldProfile.experienceLevel} → ${newProfile.experienceLevel}`)
  }

  if (oldProfile.preferredTrainingDays.length !== newProfile.preferredTrainingDays.length) {
    changes.push(
      `Training Days: ${oldProfile.preferredTrainingDays.length} days/week → ${newProfile.preferredTrainingDays.length} days/week`
    )
  }

  if (oldProfile.aggressiveness !== newProfile.aggressiveness) {
    changes.push(`Progression Pace: ${oldProfile.aggressiveness} → ${newProfile.aggressiveness}`)
  }

  return changes
}
