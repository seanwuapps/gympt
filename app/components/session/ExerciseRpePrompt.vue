<template>
  <div class="rpe-prompt">
    <div class="prompt-header">
      <h3>How did that feel?</h3>
      <p class="prompt-subtitle">Rate your effort for {{ exerciseName }}</p>
    </div>

    <div class="rpe-scale">
      <button
        v-for="value in rpeOptions"
        :key="value.score"
        type="button"
        class="rpe-btn"
        :class="{ selected: selectedRpe === value.score }"
        @click="selectedRpe = value.score"
      >
        <span class="rpe-score">{{ value.score }}</span>
        <span class="rpe-label">{{ value.label }}</span>
      </button>
    </div>

    <div class="prompt-actions">
      <BaseButton
        label="Continue"
        severity="success"
        size="large"
        @click="handleSubmit"
        class="continue-button"
      />
      <BaseButton label="Skip" text severity="secondary" @click="$emit('skip')" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  exerciseName: string
}

defineProps<Props>()

const emit = defineEmits<{
  submit: [rpe: number]
  skip: []
}>()

const selectedRpe = ref<number | null>(null)

const rpeOptions = [
  { score: 6, label: 'Very Easy' },
  { score: 7, label: 'Easy' },
  { score: 8, label: 'Moderate' },
  { score: 9, label: 'Hard' },
  { score: 10, label: 'Max Effort' },
]

function handleSubmit() {
  if (selectedRpe.value !== null) {
    emit('submit', selectedRpe.value)
  } else {
    // Default to 7 if nothing selected
    emit('submit', 7)
  }
}
</script>

<style scoped>
.rpe-prompt {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
  padding: var(--spacing-xl);
  text-align: center;
}

.prompt-header h3 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 var(--spacing-xs) 0;
  color: var(--p-text-color);
}

.prompt-subtitle {
  font-size: 1rem;
  color: var(--p-text-muted-color);
  margin: 0;
}

.rpe-scale {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.rpe-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  border: 2px solid var(--surface-border);
  border-radius: var(--border-radius);
  background: var(--surface-card);
  color: var(--p-text-color);
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: left;
}

.rpe-btn:hover {
  border-color: var(--p-primary-color);
}

.rpe-btn.selected {
  background: var(--p-primary-color);
  border-color: var(--p-primary-color);
  color: white;
}

.rpe-score {
  font-size: 1.5rem;
  font-weight: 700;
  width: 2.5rem;
  text-align: center;
}

.rpe-label {
  font-size: 1rem;
  font-weight: 500;
}

.prompt-actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
}

.continue-button {
  width: 100%;
}

.continue-button :deep(.base-button) {
  width: 100%;
  justify-content: center;
  padding: var(--spacing-lg);
  font-size: 1.125rem;
}
</style>
