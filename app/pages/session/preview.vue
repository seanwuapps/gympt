<template>
  <div class="session-preview-page">
    <!-- Loading State -->
    <div v-if="!sessionStore.currentSession" class="loading-state">
      <Card>
        <template #content>
          <div class="loading-content">
            <ProgressSpinner />
            <p>Loading session...</p>
          </div>
        </template>
      </Card>
    </div>

    <!-- Preview State -->
    <div v-else class="preview-active">
      <!-- Preview Header -->
      <Card class="preview-header-card">
        <template #content>
          <div class="preview-header">
            <div class="preview-info">
              <h1>Review Your Workout</h1>
              <p class="preview-meta">
                {{ sessionStore.currentSession.modality }} • Week
                {{ sessionStore.currentSession.week }} •
                {{ formatDayKey(sessionStore.currentSession.dayKey) }}
              </p>
              <p class="preview-description">
                Review your exercises below. You can swap any exercise before starting your session.
              </p>
            </div>
          </div>
        </template>
      </Card>

      <!-- AI Reasoning -->
      <Card v-if="sessionStore.currentSession.reasons" class="reasons-card">
        <template #content>
          <div class="reasons-content">
            <div class="reasons-header">
              <i class="pi pi-sparkles text-primary"></i>
              <h3>AI Insights</h3>
            </div>
            <p>{{ sessionStore.currentSession.reasons }}</p>
          </div>
        </template>
      </Card>

      <!-- Exercises List -->
      <div class="exercises-section">
        <div v-for="section in groupedExercises" :key="section.key" class="section-container">
          <div v-if="section.exercises.length > 0" class="section-wrapper">
            <div class="section-header">
              <i :class="section.icon"></i>
              <h2>{{ section.title }}</h2>
            </div>

            <div class="exercises-list">
              <Card
                v-for="(exercise, index) in section.exercises"
                :key="exercise.originalIndex"
                class="exercise-card"
              >
                <template #header>
                  <div class="exercise-header">
                    <div class="exercise-title">
                      <span class="exercise-number">{{ index + 1 }}</span>
                      <h3>{{ exercise.name }}</h3>
                    </div>
                    <Button
                      icon="pi pi-refresh"
                      text
                      rounded
                      severity="secondary"
                      @click="handleSwapExercise(exercise.originalIndex)"
                      :loading="swappingIndex === exercise.originalIndex"
                      v-tooltip.top="'Swap exercise'"
                    />
                  </div>
                </template>
                <template #content>
                  <div class="exercise-targets">
                    <!-- Strength Exercise -->
                    <div v-if="exercise.type === 'strength'" class="targets-grid">
                      <div v-if="exercise.sets" class="target-item">
                        <span class="target-label">Sets</span>
                        <span class="target-value">{{ exercise.sets }}</span>
                      </div>
                      <div v-if="exercise.reps" class="target-item">
                        <span class="target-label">Reps</span>
                        <span class="target-value">{{ formatReps(exercise.reps) }}</span>
                      </div>
                      <div v-if="exercise.loadKg" class="target-item">
                        <span class="target-label">Load</span>
                        <span class="target-value">{{ exercise.loadKg }} kg</span>
                      </div>
                      <div v-if="exercise.rir" class="target-item">
                        <span class="target-label">RIR</span>
                        <span class="target-value">{{ exercise.rir }}</span>
                      </div>
                      <div v-if="exercise.restSec" class="target-item">
                        <span class="target-label">Rest</span>
                        <span class="target-value">{{ exercise.restSec }}s</span>
                      </div>
                    </div>

                    <!-- Cardio Exercise -->
                    <div v-else-if="exercise.type === 'cardio'" class="targets-grid">
                      <div v-if="exercise.durationMin" class="target-item">
                        <span class="target-label">Duration</span>
                        <span class="target-value">{{ exercise.durationMin }} min</span>
                      </div>
                      <div v-if="exercise.intensity" class="target-item">
                        <span class="target-label">Intensity</span>
                        <span class="target-value">{{ exercise.intensity }}</span>
                      </div>
                      <div v-if="exercise.distanceKm" class="target-item">
                        <span class="target-label">Distance</span>
                        <span class="target-value">{{ exercise.distanceKm }} km</span>
                      </div>
                    </div>

                    <!-- HIIT Exercise -->
                    <div v-else-if="exercise.type === 'hiit'" class="targets-grid">
                      <div v-if="exercise.rounds" class="target-item">
                        <span class="target-label">Rounds</span>
                        <span class="target-value">{{ exercise.rounds }}</span>
                      </div>
                      <div v-if="exercise.workSec" class="target-item">
                        <span class="target-label">Work</span>
                        <span class="target-value">{{ exercise.workSec }}s</span>
                      </div>
                      <div v-if="exercise.restSec" class="target-item">
                        <span class="target-label">Rest</span>
                        <span class="target-value">{{ exercise.restSec }}s</span>
                      </div>
                      <div v-if="exercise.modality" class="target-item">
                        <span class="target-label">Modality</span>
                        <span class="target-value">{{ exercise.modality }}</span>
                      </div>
                    </div>

                    <!-- Crossfit Exercise -->
                    <div v-else-if="exercise.type === 'crossfit'" class="targets-grid">
                      <div v-if="exercise.format" class="target-item">
                        <span class="target-label">Format</span>
                        <span class="target-value">{{ exercise.format }}</span>
                      </div>
                      <div v-if="exercise.durationMin" class="target-item">
                        <span class="target-label">Duration</span>
                        <span class="target-value">{{ exercise.durationMin }} min</span>
                      </div>
                      <div
                        v-if="exercise.components && exercise.components.length"
                        class="target-item full-width"
                      >
                        <span class="target-label">Components</span>
                        <ul class="components-list">
                          <li v-for="(component, i) in exercise.components" :key="i">
                            {{ component }}
                          </li>
                        </ul>
                      </div>
                    </div>

                    <!-- Rehab Exercise -->
                    <div v-else-if="exercise.type === 'rehab'" class="targets-grid">
                      <div v-if="exercise.sets" class="target-item">
                        <span class="target-label">Sets</span>
                        <span class="target-value">{{ exercise.sets }}</span>
                      </div>
                      <div v-if="exercise.reps" class="target-item">
                        <span class="target-label">Reps</span>
                        <span class="target-value">{{ formatReps(exercise.reps) }}</span>
                      </div>
                      <div v-if="exercise.painCeiling" class="target-item">
                        <span class="target-label">Pain Ceiling</span>
                        <span class="target-value">{{ exercise.painCeiling }}/3</span>
                      </div>
                      <div v-if="exercise.tempo" class="target-item">
                        <span class="target-label">Tempo</span>
                        <span class="target-value">{{ exercise.tempo }}</span>
                      </div>
                    </div>
                  </div>
                </template>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <!-- Preview Actions -->
      <Card class="preview-actions-card">
        <template #content>
          <div class="preview-actions">
            <Button
              label="Confirm & Start"
              icon="pi pi-check"
              @click="handleStartWorkout"
              severity="success"
              size="large"
              :loading="starting"
            />
            <Button label="Cancel" icon="pi pi-times" @click="handleCancel" text size="large" />
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSessionStore } from '~/stores/session'

definePageMeta({
  middleware: 'auth',
})

const sessionStore = useSessionStore()
const router = useRouter()
const toast = useToast()

const swappingIndex = ref<number | null>(null)
const starting = ref(false)

const groupedExercises = computed(() => {
  if (!sessionStore.currentSession?.exercises) return []

  const exercises = sessionStore.currentSession.exercises.map((ex, index) => ({
    ...ex,
    originalIndex: index,
  }))

  const sections = [
    { key: 'warmup', title: 'Warm Up', icon: 'pi pi-sun', exercises: [] as typeof exercises },
    {
      key: 'working',
      title: 'Working Sets',
      icon: 'pi pi-bolt',
      exercises: [] as typeof exercises,
    },
    { key: 'cardio', title: 'Cardio', icon: 'pi pi-heart', exercises: [] as typeof exercises },
    { key: 'cooldown', title: 'Cool Down', icon: 'pi pi-moon', exercises: [] as typeof exercises },
  ]

  exercises.forEach((ex) => {
    const section = sections.find((s) => s.key === ex.section)
    if (section) {
      section.exercises.push(ex)
    } else {
      // Fallback for exercises without section or unknown section
      sections.find((s) => s.key === 'working')?.exercises.push(ex)
    }
  })

  return sections.filter((s) => s.exercises.length > 0)
})

// Redirect if no session
onMounted(() => {
  if (!sessionStore.currentSession) {
    toast.add({
      severity: 'warn',
      summary: 'No Session',
      detail: 'Please generate a session first',
      life: 3000,
    })
    router.push('/')
  }
})

function formatDayKey(dayKey: string): string {
  const days: Record<string, string> = {
    Mon: 'Monday',
    Tue: 'Tuesday',
    Wed: 'Wednesday',
    Thu: 'Thursday',
    Fri: 'Friday',
    Sat: 'Saturday',
    Sun: 'Sunday',
  }
  return days[dayKey] || dayKey
}

function formatReps(reps: number | [number, number] | null): string {
  if (!reps) return '-'
  if (Array.isArray(reps)) {
    return `${reps[0]}-${reps[1]}`
  }
  return String(reps)
}

async function handleSwapExercise(index: number) {
  if (!sessionStore.currentSession) return

  swappingIndex.value = index

  try {
    await sessionStore.swapExercise(sessionStore.currentSession.id, index)

    toast.add({
      severity: 'success',
      summary: 'Exercise Swapped',
      detail: 'A new exercise has been generated',
      life: 3000,
    })
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Swap Failed',
      detail: error.message || 'Failed to swap exercise',
      life: 5000,
    })
  } finally {
    swappingIndex.value = null
  }
}

async function handleStartWorkout() {
  if (!sessionStore.currentSession) return

  starting.value = true

  try {
    await sessionStore.startSession(sessionStore.currentSession.id)
    router.push('/session')
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Failed to start session',
      life: 5000,
    })
  } finally {
    starting.value = false
  }
}

async function handleCancel() {
  if (!sessionStore.currentSession) return

  try {
    await sessionStore.cancelSession(sessionStore.currentSession.id)
    router.push('/')
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Failed to cancel session',
      life: 5000,
    })
  }
}
</script>

<style scoped>
.session-preview-page {
  padding: var(--spacing-lg);
  max-width: 60rem;
  margin: 0 auto;
  padding-bottom: 6rem; /* Space for bottom nav */
}

/* Loading State */
.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: var(--spacing-xl);
  gap: var(--spacing-lg);
}

.loading-content p {
  font-size: 1rem;
  color: var(--p-text-muted-color);
  margin: 0;
}

/* Preview Header */
.preview-header-card {
  margin-bottom: var(--spacing-lg);
}

.preview-header {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.preview-info h1 {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 var(--spacing-xs) 0;
  color: var(--p-text-color);
}

.preview-meta {
  font-size: 0.875rem;
  color: var(--p-text-muted-color);
  margin: 0 0 var(--spacing-sm) 0;
  font-weight: 600;
}

.preview-description {
  font-size: 0.9375rem;
  color: var(--p-text-color);
  margin: 0;
  line-height: 1.5;
}

/* AI Reasoning */
.reasons-card {
  margin-bottom: var(--spacing-lg);
  background: var(--surface-ground);
}

.reasons-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.reasons-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.reasons-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
  color: var(--p-text-color);
}

.reasons-content p {
  font-size: 0.9375rem;
  color: var(--p-text-color);
  line-height: 1.6;
  margin: 0;
}

/* Exercises Section */
.exercises-section {
  margin-bottom: var(--spacing-lg);
}

.exercises-section h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: var(--p-text-color);
}

.section-container {
  margin-bottom: var(--spacing-xl);
}

.section-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-sm);
  border-bottom: 1px solid var(--surface-border);
}

.section-header i {
  font-size: 1.25rem;
  color: var(--p-primary-color);
}

.exercises-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.exercise-card {
  border-left: 0.25rem solid var(--p-primary-color);
}

.exercise-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md);
  gap: var(--spacing-md);
}

.exercise-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex: 1;
}

.exercise-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background: var(--p-primary-color);
  color: white;
  border-radius: 50%;
  font-weight: 600;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.exercise-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
  color: var(--p-text-color);
}

.targets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(8rem, 1fr));
  gap: var(--spacing-md);
}

.target-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.target-item.full-width {
  grid-column: 1 / -1;
}

.target-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--p-text-muted-color);
  font-weight: 600;
}

.target-value {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--p-text-color);
}

.components-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.components-list li {
  font-size: 0.9375rem;
  color: var(--p-text-color);
  padding-left: var(--spacing-md);
  position: relative;
}

.components-list li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: var(--p-primary-color);
  font-weight: bold;
}

/* Preview Actions */
.preview-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
  flex-wrap: wrap;
}

.preview-actions :deep(.p-button) {
  min-width: 12rem;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .session-preview-page {
    padding: var(--spacing-md);
    padding-bottom: 6rem;
  }

  .preview-info h1 {
    font-size: 1.5rem;
  }

  .targets-grid {
    grid-template-columns: repeat(auto-fit, minmax(6rem, 1fr));
  }

  .preview-actions {
    flex-direction: column;
    width: 100%;
  }

  .preview-actions :deep(.p-button) {
    width: 100%;
  }
}
</style>
