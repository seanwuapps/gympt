<template>
  <div class="cardio-logger">
    <!-- Exercise Info -->
    <div class="exercise-info">
      <h2 class="exercise-name">{{ exercise.name }}</h2>
      <div class="exercise-target">
        Target:
        <span v-if="exercise.durationMin">{{ exercise.durationMin }} min</span>
        <span v-if="exercise.intensity"> • {{ exercise.intensity }}</span>
        <span v-if="exercise.distanceKm"> • {{ exercise.distanceKm }} km</span>
      </div>
    </div>

    <!-- Input Fields -->
    <div class="input-section">
      <!-- Duration Input -->
      <div class="input-group">
        <label class="input-label">Duration (minutes)</label>
        <div class="stepper">
          <button
            type="button"
            class="stepper-btn"
            @click="decrementDuration"
            :disabled="duration <= 0"
          >
            −
          </button>
          <input v-model.number="duration" type="number" min="0" step="1" class="stepper-input" />
          <button type="button" class="stepper-btn" @click="incrementDuration">+</button>
        </div>
      </div>

      <!-- Distance Input (optional) -->
      <div class="input-group">
        <label class="input-label">Distance (km) - Optional</label>
        <div class="stepper">
          <button
            type="button"
            class="stepper-btn"
            @click="decrementDistance"
            :disabled="distance <= 0"
          >
            −
          </button>
          <input v-model.number="distance" type="number" min="0" step="0.1" class="stepper-input" />
          <button type="button" class="stepper-btn" @click="incrementDistance">+</button>
        </div>
      </div>

      <!-- Intensity Selector -->
      <div class="input-group">
        <label class="input-label">Intensity</label>
        <div class="intensity-buttons">
          <button
            v-for="option in intensityOptions"
            :key="option.value"
            type="button"
            class="intensity-btn"
            :class="{ active: intensity === option.value }"
            @click="intensity = option.value"
          >
            {{ option.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Complete Button -->
    <BaseButton
      label="Complete Exercise"
      severity="success"
      size="large"
      @click="handleComplete"
      class="complete-button"
    />
  </div>
</template>

<script setup lang="ts">
import type { SessionExercise } from '../../../db/schema/sessions'

interface Props {
  exercise: SessionExercise
}

const props = defineProps<Props>()

const emit = defineEmits<{
  complete: [{ durationMin: number; distanceKm?: number; intensity: 'easy' | 'moderate' | 'hard' }]
}>()

// Initialize with target values
const duration = ref(props.exercise.durationMin || 30)
const distance = ref(props.exercise.distanceKm || 0)
const intensity = ref<'easy' | 'moderate' | 'hard'>(props.exercise.intensity || 'moderate')

const intensityOptions = [
  { value: 'easy' as const, label: '😌 Easy' },
  { value: 'moderate' as const, label: '💪 Moderate' },
  { value: 'hard' as const, label: '🔥 Hard' },
]

function incrementDuration() {
  duration.value += 5
}

function decrementDuration() {
  if (duration.value >= 5) duration.value -= 5
}

function incrementDistance() {
  distance.value = Math.round((distance.value + 0.5) * 10) / 10
}

function decrementDistance() {
  if (distance.value >= 0.5) {
    distance.value = Math.round((distance.value - 0.5) * 10) / 10
  }
}

function handleComplete() {
  emit('complete', {
    durationMin: duration.value,
    distanceKm: distance.value > 0 ? distance.value : undefined,
    intensity: intensity.value,
  })
}

// Reset values when exercise changes
watch(
  () => props.exercise,
  () => {
    duration.value = props.exercise.durationMin || 30
    distance.value = props.exercise.distanceKm || 0
    intensity.value = props.exercise.intensity || 'moderate'
  },
  { deep: true }
)
</script>

<style scoped>
.cardio-logger {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
  padding: var(--spacing-lg);
}

.exercise-info {
  text-align: center;
}

.exercise-name {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 var(--spacing-sm) 0;
  color: var(--p-text-color);
}

.exercise-target {
  font-size: 1rem;
  color: var(--p-text-muted-color);
}

.input-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.input-label {
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--p-text-muted-color);
  text-align: center;
}

.stepper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
}

.stepper-btn {
  width: 3.5rem;
  height: 3.5rem;
  border: 2px solid var(--surface-border);
  border-radius: 50%;
  background: var(--surface-card);
  color: var(--p-text-color);
  font-size: 1.5rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.stepper-btn:hover:not(:disabled) {
  background: var(--p-primary-color);
  color: white;
  border-color: var(--p-primary-color);
}

.stepper-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.stepper-input {
  width: 6rem;
  height: 3.5rem;
  text-align: center;
  font-size: 2rem;
  font-weight: 700;
  border: 2px solid var(--surface-border);
  border-radius: var(--border-radius);
  background: var(--surface-card);
  color: var(--p-text-color);
  font-variant-numeric: tabular-nums;
}

.stepper-input:focus {
  outline: none;
  border-color: var(--p-primary-color);
}

/* Hide number input spinners */
.stepper-input::-webkit-outer-spin-button,
.stepper-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.stepper-input[type='number'] {
  -moz-appearance: textfield;
  appearance: textfield;
}

.intensity-buttons {
  display: flex;
  justify-content: center;
  gap: var(--spacing-sm);
}

.intensity-btn {
  flex: 1;
  max-width: 8rem;
  padding: var(--spacing-md);
  border: 2px solid var(--surface-border);
  border-radius: var(--border-radius);
  background: var(--surface-card);
  color: var(--p-text-color);
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.intensity-btn:hover {
  border-color: var(--p-primary-color);
}

.intensity-btn.active {
  background: var(--p-primary-color);
  border-color: var(--p-primary-color);
  color: white;
}

.complete-button {
  margin-top: var(--spacing-lg);
  width: 100%;
}

.complete-button :deep(.base-button) {
  width: 100%;
  justify-content: center;
  padding: var(--spacing-lg);
  font-size: 1.25rem;
}
</style>
