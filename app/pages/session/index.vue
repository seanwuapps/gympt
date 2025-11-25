<template>
  <div class="session-page">
    <!-- No Session State -->
    <div v-if="!sessionStore.currentSession" class="no-session">
      <BaseCard>
        <template #content>
          <div class="no-session-content">
            <i class="pi pi-bolt no-session-icon" />
            <h2>No Active Session</h2>
            <p>Start a training session from the home page</p>
            <BaseButton label="Go to Home" icon="" @click="router.push('/')" size="large" />
          </div>
        </template>
      </BaseCard>
    </div>

    <!-- Active Session -->
    <div v-else class="session-active">
      <!-- Session Header -->
      <BaseCard class="session-header-card">
        <template #content>
          <div class="session-header">
            <div class="session-info">
              <h1>{{ sessionStore.currentSession.modality }} Workout</h1>
              <p class="session-meta">
                Week {{ sessionStore.currentSession.week }} •
                {{ formatDayKey(sessionStore.currentSession.dayKey) }}
              </p>
            </div>
            <div class="session-status">
              <Tag
                :value="sessionStore.currentSession.status"
                :severity="getStatusSeverity(sessionStore.currentSession.status)"
              />
            </div>
          </div>
        </template>
      </BaseCard>

      <!-- Exercises List -->
      <div class="exercises-section">
        <h2>Exercises</h2>
        <div class="exercises-list">
          <BaseCard
            v-for="(exercise, index) in sessionStore.currentSession.exercises"
            :key="index"
            class="exercise-card"
          >
            <template #header>
              <div class="exercise-header">
                <span class="exercise-number">{{ index + 1 }}</span>
                <h3>{{ exercise.name }}</h3>
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
          </BaseCard>
        </div>
      </div>

      <!-- Session Actions -->
      <BaseCard class="session-actions-card">
        <template #content>
          <div class="session-actions">
            <BaseButton
              label="Complete Session"
              icon=""
              @click="handleCompleteSession"
              severity="success"
              size="large"
            />
            <BaseButton
              label="Cancel"
              icon=""
              @click="handleCancelSession"
              text
              size="large"
            />
          </div>
        </template>
      </BaseCard>
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

// Redirect if no session
onMounted(() => {
  if (!sessionStore.currentSession) {
    router.push('/')
  }
})

function formatReps(reps: number | [number, number] | null): string {
  if (!reps) return '-'
  if (Array.isArray(reps)) {
    return `${reps[0]}-${reps[1]}`
  }
  return String(reps)
}

function getStatusSeverity(
  status: string
): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined {
  const severityMap: Record<
    string,
    'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast'
  > = {
    generated: 'info',
    in_progress: 'warn',
    completed: 'success',
    cancelled: 'secondary',
  }
  return severityMap[status]
}

async function handleCompleteSession() {
  if (!sessionStore.currentSession) return

  try {
    await sessionStore.completeSession(sessionStore.currentSession.id)

    toast.add({
      severity: 'success',
      summary: 'Session Complete!',
      detail: 'Great work today!'
    })

    router.push('/')
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Failed to complete session'
    })
  }
}

async function handleCancelSession() {
  if (!sessionStore.currentSession) return

  try {
    await sessionStore.cancelSession(sessionStore.currentSession.id)
    router.push('/')
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Failed to cancel session'
    })
  }
}
</script>

<style scoped>
.session-page {
  padding: var(--spacing-lg);
  max-width: 60rem;
  margin: 0 auto;
}

/* No Session State */
.no-session-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: var(--spacing-xl);
  gap: var(--spacing-lg);
}

.no-session-icon {
  font-size: 4rem;
  color: var(--p-text-muted-color);
}

.no-session-content h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  color: var(--p-text-color);
}

.no-session-content p {
  font-size: 1rem;
  color: var(--p-text-muted-color);
  margin: 0;
}

/* Session Header */
.session-header-card {
  margin-bottom: var(--spacing-lg);
}

.session-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-md);
}

.session-info h1 {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 var(--spacing-xs) 0;
  color: var(--p-text-color);
}

.session-meta {
  font-size: 0.875rem;
  color: var(--p-text-muted-color);
  margin: 0;
}

/* Exercises Section */
.exercises-section {
  margin-bottom: var(--spacing-lg);
}

.exercises-section h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 var(--spacing-md) 0;
  color: var(--p-text-color);
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
  gap: var(--spacing-md);
  padding: var(--spacing-md);
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

/* Session Actions */
.session-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
  flex-wrap: wrap;
}

.session-actions :deep(.p-button) {
  min-width: 12rem;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .session-page {
    padding: var(--spacing-md);
  }

  .session-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .session-info h1 {
    font-size: 1.5rem;
  }

  .targets-grid {
    grid-template-columns: repeat(auto-fit, minmax(6rem, 1fr));
  }

  .session-actions {
    flex-direction: column;
    width: 100%;
  }

  .session-actions :deep(.p-button) {
    width: 100%;
  }
}
</style>




