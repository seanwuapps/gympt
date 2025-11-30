<template>
  <div class="session-summary">
    <BaseCard class="summary-card">
      <template #content>
        <div class="summary-header">
          <span class="success-icon">🎉</span>
          <h2>Workout Complete!</h2>
        </div>

        <!-- Stats -->
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-value">{{ completedExercises }}</span>
            <span class="stat-label">Exercises</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ totalSets }}</span>
            <span class="stat-label">Sets</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ formattedDuration }}</span>
            <span class="stat-label">Duration</span>
          </div>
          <div v-if="totalVolume > 0" class="stat-item">
            <span class="stat-value">{{ totalVolume.toLocaleString() }}</span>
            <span class="stat-label">kg Volume</span>
          </div>
        </div>

        <!-- Session Feedback -->
        <div class="feedback-section">
          <h3>How was your workout?</h3>

          <!-- Session RPE -->
          <div class="feedback-group">
            <label class="feedback-label">Overall Effort (RPE)</label>
            <div class="rpe-buttons">
              <button
                v-for="i in 10"
                :key="i"
                type="button"
                class="rpe-btn"
                :class="{ selected: sessionRpe === i }"
                @click="sessionRpe = i"
              >
                {{ i }}
              </button>
            </div>
          </div>

          <!-- Difficulty -->
          <div class="feedback-group">
            <label class="feedback-label">Difficulty</label>
            <div class="difficulty-buttons">
              <button
                v-for="option in difficultyOptions"
                :key="option.value"
                type="button"
                class="difficulty-btn"
                :class="{ selected: difficulty === option.value }"
                @click="difficulty = option.value"
              >
                {{ option.label }}
              </button>
            </div>
          </div>

          <!-- Notes -->
          <div class="feedback-group">
            <label class="feedback-label">Notes (optional)</label>
            <textarea
              v-model="notes"
              placeholder="How did you feel? Anything to note for next time?"
              rows="3"
              class="notes-input"
            />
          </div>
        </div>

        <!-- Actions -->
        <div class="summary-actions">
          <BaseButton
            label="Finish Workout"
            severity="success"
            size="large"
            @click="handleFinish"
            :loading="loading"
            class="finish-button"
          />
        </div>
      </template>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import type { LoggedSet, ExerciseCompletion, SessionFeedback } from '../../../db/schema/sessions'

interface Props {
  loggedSets: LoggedSet[]
  exerciseCompletions: ExerciseCompletion[]
  startedAt: string
  loading?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  finish: [feedback: SessionFeedback]
}>()

const sessionRpe = ref<number | null>(null)
const difficulty = ref<'too_easy' | 'just_right' | 'too_hard' | null>(null)
const notes = ref('')

const difficultyOptions = [
  { value: 'too_easy' as const, label: '😴 Too Easy' },
  { value: 'just_right' as const, label: '👍 Just Right' },
  { value: 'too_hard' as const, label: '😰 Too Hard' },
]

const completedExercises = computed(() => {
  return props.exerciseCompletions.filter((e) => e.status === 'completed').length
})

const totalSets = computed(() => {
  return props.loggedSets.filter((s) => !s.skipped).length
})

const totalVolume = computed(() => {
  return props.loggedSets
    .filter(
      (s): s is Extract<LoggedSet, { type: 'strength' }> => s.type === 'strength' && !s.skipped
    )
    .reduce((sum, s) => sum + s.reps * s.loadKg, 0)
})

const formattedDuration = computed(() => {
  const start = new Date(props.startedAt)
  const now = new Date()
  const diffMs = now.getTime() - start.getTime()
  const mins = Math.floor(diffMs / 60000)

  if (mins < 60) {
    return `${mins}m`
  }
  const hours = Math.floor(mins / 60)
  const remainingMins = mins % 60
  return `${hours}h ${remainingMins}m`
})

function handleFinish() {
  const feedback: SessionFeedback = {}

  if (sessionRpe.value !== null) {
    feedback.sessionRPE = sessionRpe.value
  }
  if (difficulty.value !== null) {
    feedback.difficulty = difficulty.value
  }
  if (notes.value.trim()) {
    feedback.notes = notes.value.trim()
  }

  emit('finish', feedback)
}
</script>

<style scoped>
.session-summary {
  padding: var(--spacing-lg);
}

.summary-card {
  max-width: 32rem;
  margin: 0 auto;
}

.summary-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.success-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: var(--spacing-md);
}

.summary-header h2 {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0;
  color: var(--p-text-color);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-md);
  background: var(--surface-ground);
  border-radius: var(--border-radius);
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--p-primary-color);
}

.stat-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--p-text-muted-color);
  margin-top: var(--spacing-xs);
}

.feedback-section {
  border-top: 1px solid var(--surface-border);
  padding-top: var(--spacing-xl);
}

.feedback-section h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 var(--spacing-lg) 0;
  text-align: center;
  color: var(--p-text-color);
}

.feedback-group {
  margin-bottom: var(--spacing-lg);
}

.feedback-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--p-text-muted-color);
  margin-bottom: var(--spacing-sm);
  text-align: center;
}

.rpe-buttons {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--spacing-xs);
}

.rpe-btn {
  width: 2.5rem;
  height: 2.5rem;
  border: 2px solid var(--surface-border);
  border-radius: var(--border-radius);
  background: var(--surface-card);
  color: var(--p-text-color);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.rpe-btn:hover {
  border-color: var(--p-primary-color);
}

.rpe-btn.selected {
  background: var(--p-primary-color);
  border-color: var(--p-primary-color);
  color: white;
}

.difficulty-buttons {
  display: flex;
  justify-content: center;
  gap: var(--spacing-sm);
}

.difficulty-btn {
  flex: 1;
  max-width: 8rem;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 2px solid var(--surface-border);
  border-radius: var(--border-radius);
  background: var(--surface-card);
  color: var(--p-text-color);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.difficulty-btn:hover {
  border-color: var(--p-primary-color);
}

.difficulty-btn.selected {
  background: var(--p-primary-color);
  border-color: var(--p-primary-color);
  color: white;
}

.notes-input {
  width: 100%;
  padding: var(--spacing-md);
  border: 2px solid var(--surface-border);
  border-radius: var(--border-radius);
  background: var(--surface-card);
  color: var(--p-text-color);
  font-family: inherit;
  font-size: 1rem;
  resize: vertical;
}

.notes-input:focus {
  outline: none;
  border-color: var(--p-primary-color);
}

.notes-input::placeholder {
  color: var(--p-text-muted-color);
}

.summary-actions {
  margin-top: var(--spacing-xl);
}

.finish-button {
  width: 100%;
}

.finish-button :deep(.base-button) {
  width: 100%;
  justify-content: center;
  padding: var(--spacing-lg);
  font-size: 1.125rem;
}
</style>
