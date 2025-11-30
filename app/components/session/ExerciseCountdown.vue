<template>
  <div class="exercise-countdown">
    <div class="countdown-content">
      <div class="next-exercise-label">Next Exercise</div>
      <h2 class="exercise-name">{{ exerciseName }}</h2>
      <div class="countdown-number" :class="{ pulse: countdown <= 3 }">
        {{ countdown }}
      </div>
      <p class="get-ready-text">Get Ready!</p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  exerciseName: string
  duration?: number
}

const props = withDefaults(defineProps<Props>(), {
  duration: 3,
})

const emit = defineEmits<{
  complete: []
}>()

const countdown = ref(props.duration)
let intervalId: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  intervalId = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      if (intervalId) clearInterval(intervalId)
      emit('complete')
    }
  }, 1000)
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
})
</script>

<style scoped>
.exercise-countdown {
  position: fixed;
  inset: 0;
  background: var(--surface-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.countdown-content {
  text-align: center;
  padding: var(--spacing-xl);
}

.next-exercise-label {
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--p-text-muted-color);
  margin-bottom: var(--spacing-sm);
}

.exercise-name {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--p-text-color);
  margin: 0 0 var(--spacing-xl) 0;
  max-width: 20rem;
}

.countdown-number {
  font-size: 8rem;
  font-weight: 800;
  color: var(--p-primary-color);
  line-height: 1;
  margin-bottom: var(--spacing-lg);
}

.countdown-number.pulse {
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

.get-ready-text {
  font-size: 1.25rem;
  color: var(--p-text-muted-color);
  margin: 0;
  font-weight: 500;
}
</style>
