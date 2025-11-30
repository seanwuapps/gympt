<template>
  <div class="session-progress">
    <div class="progress-header">
      <span class="exercise-counter"> Exercise {{ currentExercise }} of {{ totalExercises }} </span>
      <span v-if="showSetCounter" class="set-counter">
        Set {{ currentSet }} of {{ totalSets }}
      </span>
    </div>
    <div class="progress-bar-container">
      <div class="progress-bar" :style="{ width: progressPercent + '%' }" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  currentExercise: number
  totalExercises: number
  currentSet?: number
  totalSets?: number
}

const props = defineProps<Props>()

const showSetCounter = computed(() => props.totalSets && props.totalSets > 0)

const progressPercent = computed(() => {
  if (!props.totalExercises) return 0

  // Calculate progress based on exercises and sets
  const exerciseProgress = (props.currentExercise - 1) / props.totalExercises
  const setProgress =
    showSetCounter.value && props.totalSets
      ? ((props.currentSet || 1) - 1) / props.totalSets / props.totalExercises
      : 0

  return Math.min(100, (exerciseProgress + setProgress) * 100)
})
</script>

<style scoped>
.session-progress {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  color: var(--p-text-muted-color);
}

.exercise-counter {
  font-weight: 600;
}

.set-counter {
  color: var(--p-primary-color);
  font-weight: 600;
}

.progress-bar-container {
  height: 0.5rem;
  background: var(--surface-ground);
  border-radius: 0.25rem;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: var(--p-primary-color);
  border-radius: 0.25rem;
  transition: width 0.3s ease;
}
</style>
