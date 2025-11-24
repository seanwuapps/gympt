import { defineStore } from 'pinia'
import type { Profile } from '../../db/schema'

const STORAGE_KEY = 'gympt_onboarding_progress'

export interface ProfileFormData {
  goals?: string[]
  experienceLevel: 'beginner' | 'intermediate' | 'advanced'
  preferredTrainingDays: string[]
  injuryFlags?: string
  units: 'metric' | 'imperial'
  language: string
  aggressiveness: 'conservative' | 'moderate' | 'aggressive'
}

export interface OnboardingProgress {
  step: number
  data: Partial<ProfileFormData>
  timestamp: number
}

export const useProfileStore = defineStore('profile', () => {
  // State
  const profile = ref<Profile | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Actions
  const fetchProfile = async () => {
    loading.value = true
    error.value = null

    try {
      const data = await $fetch<Profile>('/api/profile')
      profile.value = data
      return data
    } catch (err: any) {
      if (err.statusCode === 404) {
        // Profile doesn't exist yet
        profile.value = null
        return null
      }
      error.value = err.message || 'Failed to fetch profile'
      throw err
    } finally {
      loading.value = false
    }
  }

  const saveProfile = async (data: ProfileFormData) => {
    loading.value = true
    error.value = null

    try {
      // Convert goals array to comma-separated string for backend
      const payload = {
        ...data,
        goals: data.goals && data.goals.length > 0 ? data.goals.join(', ') : undefined,
      }

      const result = await $fetch<Profile>('/api/profile', {
        method: 'POST',
        body: payload,
      })
      profile.value = result
      return result
    } catch (err: any) {
      error.value = err.message || 'Failed to save profile'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Wizard-specific helpers
  const saveProgressToLocalStorage = (step: number, data: Partial<ProfileFormData>) => {
    if (process.client) {
      const progress: OnboardingProgress = {
        step,
        data,
        timestamp: Date.now(),
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
    }
  }

  const loadProgressFromLocalStorage = (): OnboardingProgress | null => {
    if (process.client) {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        try {
          const progress: OnboardingProgress = JSON.parse(stored)
          // Check if progress is less than 24 hours old
          const hoursSinceProgress = (Date.now() - progress.timestamp) / (1000 * 60 * 60)
          if (hoursSinceProgress < 24) {
            return progress
          }
        } catch (err) {
          console.error('Failed to parse onboarding progress:', err)
        }
      }
    }
    return null
  }

  const clearProgress = () => {
    if (process.client) {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  return {
    // State
    profile,
    loading,
    error,
    // Actions
    fetchProfile,
    saveProfile,
    saveProgressToLocalStorage,
    loadProgressFromLocalStorage,
    clearProgress,
  }
})
