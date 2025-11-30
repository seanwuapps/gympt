import { defineStore } from 'pinia'
import { $fetch } from 'ofetch'
import type {
  LoggedSet,
  StrengthLoggedSet,
  CardioLoggedSet,
  HIITLoggedSet,
  RehabLoggedSet,
  CrossfitLoggedSet,
  ExerciseCompletion,
} from '../../db/schema/sessions'

// Type definitions matching unified flat structure
export interface SessionExercise {
  type: 'strength' | 'cardio' | 'hiit' | 'crossfit' | 'rehab'
  name: string
  section?: 'warmup' | 'working' | 'cardio' | 'cooldown'
  // Strength fields
  sets?: number | null
  reps?: number | [number, number] | null
  loadKg?: number | null
  rir?: number | null
  restSec?: number | null
  // Cardio fields
  durationMin?: number | null
  intensity?: 'easy' | 'moderate' | 'hard' | null
  distanceKm?: number | null
  // HIIT fields
  rounds?: number | null
  workSec?: number | null
  // Crossfit fields
  format?: 'AMRAP' | 'ForTime' | 'EMOM' | null
  components?: string[] | null
  // Rehab fields
  painCeiling?: number | null
  tempo?: string | null
  // HIIT modality
  modality?: string | null
}

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
  reasons: string | null
  exercises: SessionExercise[]
  loggedSets?: LoggedSet[]
  exerciseCompletions?: ExerciseCompletion[]
  status: 'generated' | 'in_progress' | 'completed' | 'cancelled'
  startedAt: string | null
  completedAt: string | null
  feedback: SessionFeedback | null
  createdAt: string
  updatedAt: string
}

// Rest timer state
interface RestTimerState {
  active: boolean
  remaining: number // Seconds remaining
  total: number // Total rest time for this rest period
  startedAt: string | null // When rest started
}

// Re-export types for components
export type {
  LoggedSet,
  StrengthLoggedSet,
  CardioLoggedSet,
  HIITLoggedSet,
  RehabLoggedSet,
  CrossfitLoggedSet,
  ExerciseCompletion,
}

export interface Session {
  id: string
  userId: string
  planId: string
  week: number
  dayKey: string
  modality: string
  reasons: string | null
  exercises: SessionExercise[]
  status: 'generated' | 'in_progress' | 'completed' | 'cancelled'
  startedAt: string | null
  completedAt: string | null
  feedback: SessionFeedback | null
  createdAt: string
  updatedAt: string
}

export const useSessionStore = defineStore('session', () => {
  // ============================================
  // SESSION STATE
  // ============================================
  const currentSession = ref<Session | null>(null)
  const generating = ref(false)
  const error = ref<string | null>(null)

  // ============================================
  // RUNNER STATE
  // ============================================
  const currentExerciseIndex = ref(0)
  const currentSetIndex = ref(0)
  const currentSetStartedAt = ref<string | null>(null)
  const loggedSets = ref<LoggedSet[]>([])
  const exerciseCompletions = ref<ExerciseCompletion[]>([])
  const showSummary = ref(false)
  const showExerciseRPE = ref(false)

  // Rest timer
  const restTimer = ref<RestTimerState>({
    active: false,
    remaining: 0,
    total: 0,
    startedAt: null,
  })
  let restTimerInterval: ReturnType<typeof setInterval> | null = null

  // ============================================
  // COMPUTED
  // ============================================
  const currentExercise = computed(() => {
    if (!currentSession.value) return null
    return currentSession.value.exercises[currentExerciseIndex.value] || null
  })

  const totalExercises = computed(() => {
    return currentSession.value?.exercises.length || 0
  })

  const totalSetsForCurrentExercise = computed(() => {
    if (!currentExercise.value) return 1
    return currentExercise.value.sets || 1
  })

  const isLastSetOfExercise = computed(() => {
    return currentSetIndex.value + 1 >= totalSetsForCurrentExercise.value
  })

  const isLastExercise = computed(() => {
    return currentExerciseIndex.value + 1 >= totalExercises.value
  })

  const sessionProgress = computed(() => {
    if (!currentSession.value) return 0
    const total = currentSession.value.exercises.reduce((sum, ex) => sum + (ex.sets || 1), 0)
    const completed = loggedSets.value.filter((s) => !s.skipped).length
    return total > 0 ? Math.round((completed / total) * 100) : 0
  })

  // ============================================
  // RUNNER ACTIONS
  // ============================================

  function initRunner() {
    currentExerciseIndex.value = 0
    currentSetIndex.value = 0
    currentSetStartedAt.value = new Date().toISOString()
    loggedSets.value = []
    exerciseCompletions.value = []
    showSummary.value = false
    showExerciseRPE.value = false
    stopRestTimer()
  }

  function logStrengthSet(data: { reps: number; loadKg: number }) {
    const now = new Date().toISOString()

    // Calculate rest taken (time since last set completed)
    let restTakenSec: number | undefined
    if (currentSetIndex.value > 0) {
      const prevSet = loggedSets.value
        .filter((s) => s.exerciseIndex === currentExerciseIndex.value)
        .pop()
      if (prevSet && currentSetStartedAt.value) {
        restTakenSec = Math.round(
          (new Date(currentSetStartedAt.value).getTime() -
            new Date(prevSet.completedAt).getTime()) /
            1000
        )
      }
    }

    const loggedSet: StrengthLoggedSet = {
      type: 'strength',
      exerciseIndex: currentExerciseIndex.value,
      setNumber: currentSetIndex.value + 1,
      reps: data.reps,
      loadKg: data.loadKg,
      skipped: false,
      startedAt: currentSetStartedAt.value!,
      completedAt: now,
      restTakenSec,
    }

    loggedSets.value.push(loggedSet)
    currentSetIndex.value++
    currentSetStartedAt.value = new Date().toISOString()
  }

  function logCardioExercise(data: {
    durationMin: number
    distanceKm?: number
    intensity: 'easy' | 'moderate' | 'hard'
  }) {
    const now = new Date().toISOString()

    const loggedSet: CardioLoggedSet = {
      type: 'cardio',
      exerciseIndex: currentExerciseIndex.value,
      setNumber: 1,
      durationMin: data.durationMin,
      distanceKm: data.distanceKm,
      intensity: data.intensity,
      skipped: false,
      startedAt: currentSetStartedAt.value!,
      completedAt: now,
    }

    loggedSets.value.push(loggedSet)
  }

  // Unified logSet function that handles different types
  function logSet(
    data:
      | { type: 'strength'; reps: number; loadKg: number }
      | {
          type: 'cardio'
          durationMin: number
          distanceKm?: number
          intensity: 'easy' | 'moderate' | 'hard'
        }
  ) {
    if (data.type === 'strength') {
      logStrengthSet({ reps: data.reps, loadKg: data.loadKg })
    } else if (data.type === 'cardio') {
      logCardioExercise({
        durationMin: data.durationMin,
        distanceKm: data.distanceKm,
        intensity: data.intensity,
      })
    }
  }

  function completeExercise(rpe?: number, notes?: string) {
    exerciseCompletions.value.push({
      exerciseIndex: currentExerciseIndex.value,
      status: 'completed',
      rpe,
      notes,
    })
    showExerciseRPE.value = false
    nextExercise()
  }

  function skipExercise() {
    exerciseCompletions.value.push({
      exerciseIndex: currentExerciseIndex.value,
      status: 'skipped',
    })
    nextExercise()
  }

  function nextExercise() {
    stopRestTimer()

    if (isLastExercise.value) {
      // Session complete - show summary
      showSummary.value = true
    } else {
      currentExerciseIndex.value++
      currentSetIndex.value = 0
      currentSetStartedAt.value = new Date().toISOString()
    }
  }

  // ============================================
  // REST TIMER ACTIONS
  // ============================================

  function startRestTimer(seconds: number) {
    stopRestTimer() // Clear any existing timer

    restTimer.value = {
      active: true,
      remaining: seconds,
      total: seconds,
      startedAt: new Date().toISOString(),
    }

    restTimerInterval = setInterval(() => {
      if (restTimer.value.remaining > 0) {
        restTimer.value.remaining--
      } else {
        onRestComplete()
      }
    }, 1000)
  }

  function skipRest() {
    stopRestTimer()
    currentSetStartedAt.value = new Date().toISOString()
  }

  function onRestComplete() {
    stopRestTimer()
    currentSetStartedAt.value = new Date().toISOString()
  }

  function stopRestTimer() {
    if (restTimerInterval) {
      clearInterval(restTimerInterval)
      restTimerInterval = null
    }
    restTimer.value = {
      active: false,
      remaining: 0,
      total: 0,
      startedAt: null,
    }
  }

  // ============================================
  // SESSION STATS (for summary)
  // ============================================

  const sessionStats = computed(() => {
    if (!currentSession.value) {
      return {
        duration: 0,
        exercisesCompleted: 0,
        exercisesSkipped: 0,
        totalSets: 0,
        totalVolume: 0,
      }
    }

    const startTime = currentSession.value.startedAt
      ? new Date(currentSession.value.startedAt).getTime()
      : 0
    const endTime = Date.now()
    const durationMin = startTime ? Math.round((endTime - startTime) / 1000 / 60) : 0

    const completedExercises = exerciseCompletions.value.filter(
      (e) => e.status === 'completed'
    ).length
    const skippedExercises = exerciseCompletions.value.filter((e) => e.status === 'skipped').length

    const completedSets = loggedSets.value.filter((s) => !s.skipped).length

    // Calculate volume (strength only)
    const totalVolume = loggedSets.value
      .filter((s): s is StrengthLoggedSet => s.type === 'strength' && !s.skipped)
      .reduce((sum, s) => sum + s.reps * s.loadKg, 0)

    return {
      duration: durationMin,
      exercisesCompleted: completedExercises,
      exercisesSkipped: skippedExercises,
      totalSets: completedSets,
      totalVolume,
    }
  })

  // Actions
  async function generateSession(
    planId: string,
    week: number,
    dayKey: string,
    modality: string,
    focus?: string,
    sessionLengthMin: number = 45
  ) {
    console.log('[Session Store] generateSession called with:', {
      planId,
      week,
      dayKey,
      modality,
      focus,
      sessionLengthMin,
    })
    generating.value = true
    error.value = null

    try {
      // Generate session via AI (profile will be fetched on backend)
      console.log('[Session Store] Calling AI session generation...')
      const sessionData = await $fetch<{ exercises: SessionExercise[]; reasons: string | null }>(
        '/api/ai/session.generate',
        {
          method: 'POST',
          body: {
            modality: modality.toLowerCase(),
            focus,
            sessionLengthMin,
            day: week,
            constraints: {},
          },
        }
      ).catch((err) => {
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
          reasons: sessionData.reasons,
          exercises: sessionData.exercises,
          status: 'generated',
        },
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
      const response = await $fetch<{ success: boolean; session: Session }>(
        `/api/sessions/${sessionId}`,
        {
          method: 'PATCH',
          body: {
            status: 'in_progress',
            startedAt: new Date().toISOString(),
          },
        }
      )

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
          feedback,
          loggedSets: loggedSets.value,
          exerciseCompletions: exerciseCompletions.value,
        },
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
          status: 'cancelled',
        },
      })

      clearSession()
    } catch (err: any) {
      error.value = err.message || 'Failed to cancel session'
      throw err
    }
  }

  async function loadSession(sessionId: string) {
    try {
      const response = await $fetch<{ success: boolean; session: Session }>(
        `/api/sessions/${sessionId}`
      )
      currentSession.value = response.session
      return response.session
    } catch (err: any) {
      error.value = err.message || 'Failed to load session'
      throw err
    }
  }

  async function fetchSessionByDay(planId: string, week: number, dayKey: string) {
    try {
      const response = await $fetch<{ success: boolean; sessions: Session[]; count: number }>(
        '/api/sessions',
        {
          params: {
            planId,
            week,
            dayKey,
            limit: 1,
          },
        }
      )

      if (response.sessions && response.sessions.length > 0) {
        return response.sessions[0]
      }
      return null
    } catch (err: any) {
      console.error('[Session Store] Failed to fetch session by day:', err)
      // Don't throw here, just return null so we can proceed with generation if needed
      return null
    }
  }

  async function swapExercise(sessionId: string, exerciseIndex: number) {
    try {
      const response = await $fetch<{ success: boolean; exercise: SessionExercise }>(
        `/api/sessions/${sessionId}/swap-exercise`,
        {
          method: 'POST',
          body: {
            exerciseIndex,
          },
        }
      )

      // Update the exercise in current session
      if (currentSession.value && response.exercise) {
        currentSession.value.exercises[exerciseIndex] = response.exercise
      }

      return response.exercise
    } catch (err: any) {
      error.value = err.message || 'Failed to swap exercise'
      throw err
    }
  }

  function clearSession() {
    currentSession.value = null
    error.value = null
  }

  return {
    // Session State
    currentSession,
    generating,
    error,
    // Runner State
    currentExerciseIndex,
    currentSetNumber: currentSetIndex,
    loggedSets,
    exerciseCompletions,
    restTimeRemaining: computed(() => restTimer.value.remaining),
    restTimerRunning: computed(() => restTimer.value.active),
    showSummary,
    showExerciseRPE,
    // Computed
    currentExercise,
    totalExercises,
    totalSetsForCurrentExercise,
    isLastSetOfExercise,
    isLastExercise,
    sessionProgress,
    sessionStats,
    // Session Actions
    generateSession,
    startSession,
    completeSession,
    cancelSession,
    loadSession,
    fetchSessionByDay,
    swapExercise,
    clearSession,
    // Runner Actions
    initRunner,
    logSet,
    completeExercise,
    skipExercise,
    nextExercise,
    // Rest Timer Actions
    startRestTimer,
    stopRestTimer,
    skipRest,
  }
})
