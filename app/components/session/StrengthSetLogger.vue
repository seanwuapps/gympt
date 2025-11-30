<template>
  <div class="strength-logger">
    <!-- Current Set Info -->
    <div class="set-info">
      <h2 class="exercise-name">{{ exercise.name }}</h2>
      <div class="set-target">
        Target: {{ exercise.sets }} sets × {{ formatReps(exercise.reps) }} reps
        <span v-if="exercise.loadKg">@ {{ exercise.loadKg }}kg</span>
      </div>
    </div>

    <!-- Input Fields -->
    <div class="input-section">
      <!-- Reps Input -->
      <div class="input-group">
        <label class="input-label">Reps Completed</label>
        <div class="stepper">
          <button type="button" class="stepper-btn" @click="decrementReps" :disabled="reps <= 0">
            −
          </button>
          <input v-model.number="reps" type="number" min="0" max="100" class="stepper-input" />
          <button type="button" class="stepper-btn" @click="incrementReps">+</button>
        </div>
      </div>

      <!-- Load Input -->
      <div class="input-group">
        <label class="input-label">Load (kg)</label>
        <div class="stepper">
          <button type="button" class="stepper-btn" @click="decrementLoad" :disabled="load <= 0">
            −
          </button>
          <input v-model.number="load" type="number" min="0" step="0.5" class="stepper-input" />
          <button type="button" class="stepper-btn" @click="incrementLoad">+</button>
        </div>
        <div class="quick-adjust">
          <button type="button" class="quick-btn" @click="load += 2.5">+2.5</button>
          <button type="button" class="quick-btn" @click="load += 5">+5</button>
        </div>
      </div>
    </div>

    <!-- Complete Button -->
    <BaseButton
      label="Complete Set"
      severity="success"
      size="large"
      @click="handleComplete"
      class="complete-button"
      :disabled="reps === 0"
    />
  </div>
</template>

<script setup lang="ts">
import type { SessionExercise } from '../../../db/schema/sessions'

interface Props {
  exercise: SessionExercise
  setNumber: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  complete: [{ reps: number; loadKg: number }]
}>()

// Initialize with target values
const reps = ref(getTargetReps())
const load = ref(props.exercise.loadKg || 0)

function getTargetReps(): number {
  const targetReps = props.exercise.reps
  if (!targetReps) return 8
  if (Array.isArray(targetReps)) {
    // Use middle of range
    return Math.round((targetReps[0] + targetReps[1]) / 2)
  }
  return targetReps
}

function formatReps(reps: number | [number, number] | null | undefined): string {
  if (!reps) return '-'
  if (Array.isArray(reps)) {
    return `${reps[0]}-${reps[1]}`
  }
  return String(reps)
}

function incrementReps() {
  reps.value++
}

function decrementReps() {
  if (reps.value > 0) reps.value--
}

function incrementLoad() {
  load.value += 2.5
}

function decrementLoad() {
  if (load.value >= 2.5) load.value -= 2.5
}

function handleComplete() {
  emit('complete', {
    reps: reps.value,
    loadKg: load.value,
  })
}

// Reset values when exercise changes
watch(
  () => props.exercise,
  () => {
    reps.value = getTargetReps()
    load.value = props.exercise.loadKg || 0
  },
  { deep: true }
)
</script>

<style scoped>
.strength-logger {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
  padding: var(--spacing-lg);
}

.set-info {
  text-align: center;
}

.exercise-name {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 var(--spacing-sm) 0;
  color: var(--p-text-color);
}

.set-target {
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

.quick-adjust {
  display: flex;
  justify-content: center;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-xs);
}

.quick-btn {
  padding: var(--spacing-xs) var(--spacing-md);
  border: 1px solid var(--surface-border);
  border-radius: var(--border-radius);
  background: var(--surface-ground);
  color: var(--p-text-muted-color);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.quick-btn:hover {
  background: var(--p-primary-color);
  color: white;
  border-color: var(--p-primary-color);
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
