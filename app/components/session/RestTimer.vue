<template>
  <div class="rest-timer" :class="{ warning: isWarning, urgent: isUrgent }">
    <div class="timer-display">
      <span class="timer-value">{{ formattedTime }}</span>
      <span class="timer-label">Rest Time</span>
    </div>
    <div class="timer-bar-container">
      <div class="timer-bar" :style="{ width: progressPercent + '%' }" />
    </div>
    <BaseButton
      label="Skip Rest"
      severity="secondary"
      text
      @click="$emit('skip')"
      class="skip-button"
    />
  </div>
</template>

<script setup lang="ts">
interface Props {
  remaining: number // seconds remaining
  total: number // total rest time in seconds
}

const props = defineProps<Props>()

defineEmits<{
  skip: []
}>()

const formattedTime = computed(() => {
  const mins = Math.floor(props.remaining / 60)
  const secs = props.remaining % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
})

const progressPercent = computed(() => {
  if (!props.total) return 100
  return (props.remaining / props.total) * 100
})

const isWarning = computed(() => props.remaining <= 30 && props.remaining > 10)
const isUrgent = computed(() => props.remaining <= 10)
</script>

<style scoped>
.rest-timer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-xl);
  background: var(--surface-card);
  border-radius: var(--border-radius);
  text-align: center;
}

.timer-display {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.timer-value {
  font-size: 4rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--p-primary-color);
  line-height: 1;
}

.rest-timer.warning .timer-value {
  color: var(--p-warn-color, #f59e0b);
}

.rest-timer.urgent .timer-value {
  color: var(--p-danger-color, #ef4444);
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.timer-label {
  font-size: 1rem;
  color: var(--p-text-muted-color);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.timer-bar-container {
  width: 100%;
  max-width: 20rem;
  height: 0.5rem;
  background: var(--surface-ground);
  border-radius: 0.25rem;
  overflow: hidden;
}

.timer-bar {
  height: 100%;
  background: var(--p-primary-color);
  border-radius: 0.25rem;
  transition: width 0.3s ease;
}

.rest-timer.warning .timer-bar {
  background: var(--p-warn-color, #f59e0b);
}

.rest-timer.urgent .timer-bar {
  background: var(--p-danger-color, #ef4444);
}

.skip-button {
  margin-top: var(--spacing-sm);
}
</style>
