<template>
  <div class="session-runner">
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
      <div class="skip-action">
        <BaseButton label="Skip Exercise" text severity="secondary" @click="confirmSkipExercise" />
      </div>
    </div>

    <!-- Skip Confirmation Dialog -->
    <BaseDialog v-model:visible="showSkipDialog" header="Skip Exercise?" class="skip-dialog">
      <p>Are you sure you want to skip {{ currentExercise?.name }}?</p>
      <template #footer>
        <BaseButton label="Cancel" text @click="showSkipDialog = false" />
        <BaseButton label="Skip" severity="danger" @click="handleSkipExercise" />
      </template>
    </BaseDialog>
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
const completing = ref(false)
const currentRestDuration = ref(90)

// Computed
const exercises = computed<SessionExercise[]>(() => sessionStore.currentSession?.exercises || [])

const currentExercise = computed<SessionExercise | undefined>(
  () => exercises.value[currentExerciseIndex.value]
)

const sessionStartedAt = computed(
  () => sessionStore.currentSession?.startedAt || new Date().toISOString()
)

const showSummary = computed(() => currentExerciseIndex.value >= exercises.value.length)

// Initialize runner on mount
onMounted(() => {
  if (!sessionStore.currentSession) {
    router.push('/')
    return
  }
  sessionStore.initRunner()
})

// Clean up on unmount
onUnmounted(() => {
  sessionStore.stopRestTimer()
})

// Handlers
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
    // Show RPE prompt after last set
    showRpePrompt.value = true
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

  // Cardio is single "set", go straight to RPE
  showRpePrompt.value = true
}

function handleGenericComplete() {
  // For unsupported types, just complete the exercise
  showRpePrompt.value = true
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

.skip-action {
  margin-top: auto;
  padding-top: var(--spacing-xl);
  text-align: center;
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
