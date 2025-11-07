<template>
  <div class="plan-generator">
    <!-- Idle State -->
    <div v-if="!generating && !generatedPlan && !error" class="generator-idle">
      <div class="generator-icon">
        <i class="pi pi-sparkles" />
      </div>
      <h3>Generate Your Training Plan</h3>
      <p class="description">
        Our AI will create a personalized training plan based on your goals, experience level, and schedule.
      </p>
      <Button
        label="Generate Plan"
        icon="pi pi-sparkles"
        :loading="generating"
        @click="handleGenerate"
        size="large"
        class="generate-button"
      />
    </div>

    <!-- Loading State -->
    <div v-if="generating" class="generator-loading">
      <ProgressSpinner />
      <h3>Creating Your Plan...</h3>
      <p class="loading-message">{{ loadingMessage }}</p>
    </div>

    <!-- Success State -->
    <div v-if="generatedPlan && !generating" class="generator-success">
      <div class="success-icon">
        <i class="pi pi-check-circle" />
      </div>
      <h3>Plan Generated!</h3>
      <Card class="plan-preview">
        <template #title>
          <div class="plan-title">
            <i class="pi pi-calendar" />
            {{ generatedPlan.name }}
          </div>
        </template>
        <template #content>
          <div class="plan-details">
            <div class="detail-item">
              <span class="label">Duration:</span>
              <span class="value">{{ generatedPlan.durationWeeks }} weeks</span>
            </div>
            <div class="detail-item">
              <span class="label">Created:</span>
              <span class="value">{{ formatDate(generatedPlan.createdAt) }}</span>
            </div>
          </div>
          
          <!-- Week 1 Preview -->
          <div class="week-preview">
            <h4>Week 1 Schedule:</h4>
            <div class="schedule-grid">
              <div
                v-for="(modality, day) in getWeekSchedule(1)"
                :key="day"
                class="schedule-day"
              >
                <span class="day-label">{{ day }}</span>
                <span class="day-modality">{{ modality }}</span>
              </div>
            </div>
          </div>
        </template>
        <template #footer>
          <div class="plan-actions">
            <Button
              label="View Full Plan"
              icon="pi pi-eye"
              @click="emit('view-plan', generatedPlan)"
              outlined
            />
            <Button
              label="Set as Active"
              icon="pi pi-check"
              @click="emit('activate-plan', generatedPlan.id)"
            />
          </div>
        </template>
      </Card>
    </div>

    <!-- Error State -->
    <div v-if="error && !generating" class="generator-error">
      <div class="error-icon">
        <i class="pi pi-exclamation-triangle" />
      </div>
      <h3>Generation Failed</h3>
      <p class="error-message">{{ error }}</p>
      <div class="error-actions">
        <Button
          label="Try Again"
          icon="pi pi-refresh"
          @click="handleGenerate"
          outlined
        />
        <Button
          label="Cancel"
          icon="pi pi-times"
          @click="emit('cancel')"
          severity="secondary"
          text
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePlansStore } from '~/stores/plans'
import type { TrainingPlan } from '~/db/schema'

const emit = defineEmits<{
  'plan-generated': [plan: TrainingPlan]
  'view-plan': [plan: TrainingPlan]
  'activate-plan': [planId: string]
  'cancel': []
}>()

const plansStore = usePlansStore()
const toast = useToast()

const generating = ref(false)
const generatedPlan = ref<TrainingPlan | null>(null)
const error = ref<string | null>(null)
const loadingMessage = ref('Analyzing your profile...')

const loadingMessages = [
  'Analyzing your profile...',
  'Designing your program...',
  'Optimizing training schedule...',
  'Finalizing your plan...'
]

let messageInterval: NodeJS.Timeout | null = null

async function handleGenerate() {
  generating.value = true
  error.value = null
  generatedPlan.value = null
  loadingMessage.value = loadingMessages[0]

  // Cycle through loading messages
  let messageIndex = 0
  messageInterval = setInterval(() => {
    messageIndex = (messageIndex + 1) % loadingMessages.length
    loadingMessage.value = loadingMessages[messageIndex]
  }, 2000)

  try {
    const plan = await plansStore.generatePlan()
    
    if (plan) {
      generatedPlan.value = plan
      emit('plan-generated', plan)
      
      toast.add({
        severity: 'success',
        summary: 'Plan Generated!',
        detail: 'Your personalized training plan is ready.',
        life: 3000
      })
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to generate plan. Please try again.'
    
    toast.add({
      severity: 'error',
      summary: 'Generation Failed',
      detail: error.value,
      life: 5000
    })
  } finally {
    generating.value = false
    if (messageInterval) {
      clearInterval(messageInterval)
      messageInterval = null
    }
  }
}

function getWeekSchedule(weekNumber: number) {
  if (!generatedPlan.value) return {}
  
  const schedule = generatedPlan.value.weeklySchedule as Record<string, Record<string, string>>
  return schedule[`week${weekNumber}`] || {}
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

onUnmounted(() => {
  if (messageInterval) {
    clearInterval(messageInterval)
  }
})
</script>

<style scoped>
.plan-generator {
  width: 100%;
  max-width: 40rem;
  margin: 0 auto;
}

.generator-idle,
.generator-loading,
.generator-success,
.generator-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-xl);
  text-align: center;
}

.generator-icon,
.success-icon,
.error-icon {
  font-size: 4rem;
  color: var(--p-primary-color);
}

.error-icon {
  color: var(--p-red-500);
}

.success-icon {
  color: var(--p-green-500);
}

h3 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  color: var(--p-text-color);
}

.description,
.loading-message,
.error-message {
  font-size: 1rem;
  color: var(--p-text-muted-color);
  max-width: 30rem;
  margin: 0;
}

.generate-button {
  min-width: 12rem;
  min-height: 3rem;
}

.generator-loading {
  padding: var(--spacing-xl) var(--spacing-lg);
}

.plan-preview {
  width: 100%;
  margin-top: var(--spacing-md);
}

.plan-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: 1.25rem;
}

.plan-details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-sm) 0;
  border-bottom: 1px solid var(--p-surface-border);
}

.detail-item .label {
  font-weight: 600;
  color: var(--p-text-muted-color);
}

.detail-item .value {
  color: var(--p-text-color);
}

.week-preview {
  margin-top: var(--spacing-lg);
}

.week-preview h4 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: var(--spacing-md);
  color: var(--p-text-color);
}

.schedule-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(5rem, 1fr));
  gap: var(--spacing-sm);
}

.schedule-day {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm);
  background: var(--p-surface-50);
  border-radius: var(--p-border-radius);
  text-align: center;
}

.day-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--p-text-muted-color);
  text-transform: uppercase;
}

.day-modality {
  font-size: 0.875rem;
  color: var(--p-text-color);
  word-break: break-word;
}

.plan-actions,
.error-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .plan-generator {
    max-width: 100%;
  }

  .generator-idle,
  .generator-loading,
  .generator-success,
  .generator-error {
    padding: var(--spacing-lg);
  }

  .schedule-grid {
    grid-template-columns: repeat(auto-fit, minmax(4rem, 1fr));
  }

  .plan-actions,
  .error-actions {
    flex-direction: column;
    width: 100%;
  }

  .plan-actions :deep(.p-button),
  .error-actions :deep(.p-button) {
    width: 100%;
  }
}
</style>
