<template>
  <div class="session-runner">
    <!-- Exercise Countdown (before each new exercise) -->
    <ExerciseCountdown
      v-if="showCountdown"
      :exercise-name="currentExercise?.name || 'Exercise'"
      :duration="3"
      @complete="handleCountdownComplete"
    />

    <template v-else>
      <!-- Progress Bar -->
      <SessionProgress
        :current-exercise="currentExerciseIndex + 1"
        :total-exercises="exercises.length"
        :current-set="currentSetNumber"
        :total-sets="currentExercise?.sets || 0"
        class="runner-progress"
      />

      <!-- Session Summary (after all exercises) -->
      <SessionSummary
        v-if="showSummary"
        :logged-sets="loggedSets"
        :exercise-completions="exerciseCompletions"
        :started-at="sessionStartedAt"
        :loading="completing"
        @finish="handleFinish"
      />

      <!-- Rest Timer -->
      <RestTimer
        v-else-if="isResting"
        :remaining="restTimeRemaining"
        :total="currentRestDuration"
        @skip="handleSkipRest"
      />

      <!-- RPE Prompt -->
      <ExerciseRpePrompt
        v-else-if="showRpePrompt"
        :exercise-name="currentExercise?.name || ''"
        @submit="handleRpeSubmit"
        @skip="handleRpeSkip"
      />

      <!-- Exercise Logger -->
      <div v-else class="exercise-view">
        <!-- Strength Exercise -->
        <StrengthSetLogger
          v-if="currentExercise?.type === 'strength'"
          :exercise="currentExercise"
          :set-number="currentSetNumber"
          @complete="handleStrengthSetComplete"
        />

        <!-- Cardio Exercise -->
        <CardioLogger
          v-else-if="currentExercise?.type === 'cardio'"
          :exercise="currentExercise"
          @complete="handleCardioComplete"
        />

        <!-- Generic fallback for other types -->
        <div v-else class="generic-exercise">
          <BaseCard>
            <template #content>
              <div class="generic-content">
                <h2>{{ currentExercise?.name }}</h2>
                <p class="exercise-type">{{ currentExercise?.type }}</p>
                <BaseButton
                  label="Complete Exercise"
                  severity="success"
                  size="large"
                  @click="handleGenericComplete"
                  class="complete-button"
                />
              </div>
            </template>
          </BaseCard>
        </div>

        <!-- Skip Exercise Button -->
        <div class="skip-actions">
          <BaseButton
            label="Skip Exercise"
            text
            severity="secondary"
            @click="confirmSkipExercise"
          />
          <BaseButton
            label="Skip Entire Workout"
            severity="danger"
            @click="showSkipSessionDialog = true"
          />
        </div>
      </div>
    </template>

    <!-- Skip Exercise Confirmation Dialog -->
    <BaseDialog v-model:visible="showSkipDialog" header="Skip Exercise?" class="skip-dialog">
      <p>Are you sure you want to skip {{ currentExercise?.name }}?</p>
      <template #footer>
        <BaseButton label="Cancel" text @click="showSkipDialog = false" />
        <BaseButton label="Skip" severity="danger" @click="handleSkipExercise" />
      </template>
    </BaseDialog>
    <!-- Skip Session Dialog -->
    <SkipSessionDialog
      v-model:visible="showSkipSessionDialog"
      :loading="skippingSession"
      @confirm="handleSkipSession"
      @cancel="showSkipSessionDialog = false"
    />
  </div>
</template>

<script setup lang="ts">
import { useSessionStore } from '~/stores/session'
import type { SessionExercise, SessionFeedback } from '../../../db/schema/sessions'

const sessionStore = useSessionStore()
const router = useRouter()
const toast = useToast()

// Runner state from store
const currentExerciseIndex = computed(() => sessionStore.currentExerciseIndex)
const currentSetNumber = computed(() => sessionStore.currentSetNumber)
const loggedSets = computed(() => sessionStore.loggedSets)
const exerciseCompletions = computed(() => sessionStore.exerciseCompletions)
const restTimeRemaining = computed(() => sessionStore.restTimeRemaining)
const isResting = computed(() => sessionStore.restTimerRunning)

// Local state
const showRpePrompt = ref(false)
const showSkipDialog = ref(false)
const showSkipSessionDialog = ref(false)
const showCountdown = ref(true) // Show countdown at start
const completing = ref(false)
const skippingSession = ref(false)
const currentRestDuration = ref(90)
const lastExerciseIndex = ref(-1) // Track exercise changes

// Computed
const exercises = computed<SessionExercise[]>(() => sessionStore.currentSession?.exercises || [])

const currentExercise = computed<SessionExercise | undefined>(
  () => exercises.value[currentExerciseIndex.value]
)

const sessionStartedAt = computed(
  () => sessionStore.currentSession?.startedAt || new Date().toISOString()
)

const showSummary = computed(() => currentExerciseIndex.value >= exercises.value.length)

// Check if current exercise is a working set (not warmup/cooldown)
const isWorkingSet = computed(() => {
  const section = currentExercise.value?.section
  return section === 'working' || section === undefined
})

// Initialize runner on mount
onMounted(() => {
  if (!sessionStore.currentSession) {
    router.push('/')
    return
  }
  sessionStore.initRunner()
  lastExerciseIndex.value = 0
  showCountdown.value = true // Show countdown for first exercise
})

// Watch for exercise changes to show countdown
watch(currentExerciseIndex, (newIndex, oldIndex) => {
  // Show countdown when moving to a new exercise (not when just starting or at summary)
  if (newIndex !== oldIndex && newIndex < exercises.value.length && oldIndex >= 0) {
    lastExerciseIndex.value = newIndex
    showCountdown.value = true
  }
})

// Clean up on unmount
onUnmounted(() => {
  sessionStore.stopRestTimer()
})

// Handlers
function handleCountdownComplete() {
  showCountdown.value = false
}

function handleStrengthSetComplete(data: { reps: number; loadKg: number }) {
  const exercise = currentExercise.value
  if (!exercise) return

  sessionStore.logSet({
    type: 'strength',
    reps: data.reps,
    loadKg: data.loadKg,
  })

  const totalSets = exercise.sets || 1

  // Check if this was the last set
  if (currentSetNumber.value >= totalSets) {
    // Only show RPE prompt for working sets, skip for warmup/cooldown
    if (isWorkingSet.value) {
      showRpePrompt.value = true
    } else {
      // Auto-complete without RPE for warmup/cooldown
      sessionStore.completeExercise()
    }
  } else {
    // Start rest timer
    currentRestDuration.value = exercise.restSec || 90
    sessionStore.startRestTimer(currentRestDuration.value)
  }
}

function handleCardioComplete(data: {
  durationMin: number
  distanceKm?: number
  intensity: 'easy' | 'moderate' | 'hard'
}) {
  sessionStore.logSet({
    type: 'cardio',
    durationMin: data.durationMin,
    distanceKm: data.distanceKm,
    intensity: data.intensity,
  })

  // Only show RPE prompt for working sets
  if (isWorkingSet.value) {
    showRpePrompt.value = true
  } else {
    sessionStore.completeExercise()
  }
}

function handleGenericComplete() {
  // Only show RPE prompt for working sets
  if (isWorkingSet.value) {
    showRpePrompt.value = true
  } else {
    sessionStore.completeExercise()
  }
}

function handleRpeSubmit(rpe: number) {
  sessionStore.completeExercise(rpe)
  showRpePrompt.value = false
}

function handleRpeSkip() {
  sessionStore.completeExercise()
  showRpePrompt.value = false
}

function handleSkipRest() {
  sessionStore.stopRestTimer()
}

function confirmSkipExercise() {
  showSkipDialog.value = true
}

function handleSkipExercise() {
  sessionStore.skipExercise()
  showSkipDialog.value = false
  showRpePrompt.value = false
}

async function handleSkipSession(
  reason: 'rest_day' | 'holiday' | 'sick' | 'injury' | 'busy' | 'other',
  notes?: string
) {
  if (!sessionStore.currentSession) return

  skippingSession.value = true

  try {
    await sessionStore.skipSession(sessionStore.currentSession.id, reason, notes)

    toast.add({
      severity: 'info',
      summary: 'Workout Skipped',
      detail:
        reason === 'rest_day' ? 'Enjoy your rest day! 😴' : "No worries, we'll adjust your plan.",
    })

    router.push('/')
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Failed to skip session',
    })
  } finally {
    skippingSession.value = false
    showSkipSessionDialog.value = false
  }
}

async function handleFinish(feedback: SessionFeedback) {
  if (!sessionStore.currentSession) return

  completing.value = true

  try {
    await sessionStore.completeSession(sessionStore.currentSession.id, feedback)

    toast.add({
      severity: 'success',
      summary: 'Workout Complete! 🎉',
      detail: 'Great work today!',
    })

    router.push('/')
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Failed to save workout',
    })
  } finally {
    completing.value = false
  }
}
</script>

<style scoped>
.session-runner {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: var(--spacing-lg);
  padding-bottom: 6rem; /* Space for bottom nav */
}

.runner-progress {
  margin-bottom: var(--spacing-lg);
}

.exercise-view {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.skip-actions {
  margin-top: auto;
  padding-top: var(--spacing-xl);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
}

.generic-exercise {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.generic-content {
  text-align: center;
  padding: var(--spacing-xl);
}

.generic-content h2 {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 var(--spacing-sm) 0;
}

.exercise-type {
  color: var(--p-text-muted-color);
  text-transform: capitalize;
  margin: 0 0 var(--spacing-xl) 0;
}

.complete-button {
  width: 100%;
  max-width: 20rem;
}

.skip-dialog :deep(.base-dialog) {
  max-width: 24rem;
}
</style>
