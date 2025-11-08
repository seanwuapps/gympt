import { defineStore } from 'pinia'
import { $fetch } from 'ofetch'

// Type definitions matching db/schema/sessions.ts
export interface StrengthTarget {
  sets: number
  reps: number | [number, number]
  loadKg?: number
  rir?: number
  restSec?: number
}

export interface CardioTarget {
  durationMin: number
  intensity: 'easy' | 'moderate' | 'hard'
  distanceKm?: number
}

export interface HIITTarget {
  rounds: number
  workSec: number
  restSec: number
  modality: string
}

export interface CrossfitTarget {
  format: 'AMRAP' | 'ForTime' | 'EMOM'
  durationMin: number
  components: string[]
}

export interface RehabTarget {
  sets: number
  reps: number
  painCeiling: number
  tempo?: string
}

export type SessionExercise =
  | { type: 'strength'; name: string; targets: StrengthTarget }
  | { type: 'cardio'; name: string; targets: CardioTarget }
  | { type: 'hiit'; name: string; targets: HIITTarget }
  | { type: 'crossfit'; name: string; targets: CrossfitTarget }
  | { type: 'rehab'; name: string; targets: RehabTarget }

export interface SessionFeedback {
  sessionRPE?: number
  difficulty?: 'too_easy' | 'just_right' | 'too_hard'
  notes?: string
  soreness?: string[]
  injuries?: string[]
}

export interface Session {
  id: string
  userId: string
  planId: string
  week: number
  dayKey: string
  modality: string
  exercises: SessionExercise[]
  status: 'generated' | 'in_progress' | 'completed' | 'cancelled'
  startedAt: string | null
  completedAt: string | null
  feedback: SessionFeedback | null
  createdAt: string
  updatedAt: string
}

export const useSessionStore = defineStore('session', () => {
  // State
  const currentSession = ref<Session | null>(null)
  const generating = ref(false)
  const error = ref<string | null>(null)

  // Actions
  async function generateSession(
    planId: string,
    week: number,
    dayKey: string,
    modality: string,
    sessionLengthMin: number = 45
  ) {
    console.log('[Session Store] generateSession called with:', { planId, week, dayKey, modality, sessionLengthMin })
    generating.value = true
    error.value = null

    try {
      // Generate session via AI (profile will be fetched on backend)
      console.log('[Session Store] Calling AI session generation...')
      const sessionData = await $fetch<{ exercises: SessionExercise[] }>('/api/ai/session.generate', {
        method: 'POST',
        body: {
          modality: modality.toLowerCase(),
          sessionLengthMin,
          day: week,
          constraints: {}
        }
      }).catch((err) => {
        console.error('[Session Store] AI generation failed:', err)
        throw new Error(`AI session generation failed: ${err.message || 'Unknown error'}`)
      })
      
      console.log('[Session Store] AI session generated:', sessionData)
      console.log('[Session Store] Exercises count:', sessionData.exercises?.length || 0)
      
      // Validate exercises exist
      if (!sessionData.exercises || sessionData.exercises.length === 0) {
        throw new Error('AI generated session with no exercises')
      }

      // Save session to database
      console.log('[Session Store] Saving session to database...')
      const savedSession = await $fetch<{ success: boolean; session: Session }>('/api/sessions', {
        method: 'POST',
        body: {
          planId,
          week,
          dayKey,
          modality,
          exercises: sessionData.exercises,
          status: 'generated'
        }
      })
      console.log('[Session Store] Session saved:', savedSession)

      // Store session in state
      currentSession.value = savedSession.session

      return currentSession.value
    } catch (err: any) {
      error.value = err.message || 'Failed to generate session'
      console.error('[Session Store] Error generating session:', err)
      throw err
    } finally {
      generating.value = false
    }
  }

  async function startSession(sessionId: string) {
    try {
      const response = await $fetch<{ success: boolean; session: Session }>(`/api/sessions/${sessionId}`, {
        method: 'PATCH',
        body: {
          status: 'in_progress',
          startedAt: new Date().toISOString()
        }
      })

      if (currentSession.value && currentSession.value.id === sessionId) {
        currentSession.value = response.session
      }

      return response.session
    } catch (err: any) {
      error.value = err.message || 'Failed to start session'
      throw err
    }
  }

  async function completeSession(sessionId: string, feedback?: SessionFeedback) {
    try {
      await $fetch(`/api/sessions/${sessionId}`, {
        method: 'PATCH',
        body: {
          status: 'completed',
          completedAt: new Date().toISOString(),
          feedback
        }
      })

      clearSession()
    } catch (err: any) {
      error.value = err.message || 'Failed to complete session'
      throw err
    }
  }

  async function cancelSession(sessionId: string) {
    try {
      await $fetch(`/api/sessions/${sessionId}`, {
        method: 'PATCH',
        body: {
          status: 'cancelled'
        }
      })

      clearSession()
    } catch (err: any) {
      error.value = err.message || 'Failed to cancel session'
      throw err
    }
  }

  async function loadSession(sessionId: string) {
    try {
      const response = await $fetch<{ success: boolean; session: Session }>(`/api/sessions/${sessionId}`)
      currentSession.value = response.session
      return response.session
    } catch (err: any) {
      error.value = err.message || 'Failed to load session'
      throw err
    }
  }

  function clearSession() {
    currentSession.value = null
    error.value = null
  }

  return {
    // State
    currentSession,
    generating,
    error,
    // Actions
    generateSession,
    startSession,
    completeSession,
    cancelSession,
    loadSession,
    clearSession
  }
})
