<script setup lang="ts">
import { usePlansStore } from '~/stores/plans'
import { useSessionStore } from '~/stores/session'
import SkipSessionDialog from '~/components/session/SkipSessionDialog.vue'

definePageMeta({
  middleware: 'auth',
})

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const plansStore = usePlansStore()
const sessionStore = useSessionStore()
const router = useRouter()
const toast = useToast()

const showGenerator = ref(false)
const showSessionLengthDialog = ref(false)
const showSkipSessionDialog = ref(false)
const skippingSession = ref(false)
const selectedSessionLength = ref(45) // Default 45 minutes

const sessionLengthOptions = [
  { label: '30 minutes', value: 30, icon: 'pi-clock' },
  { label: '45 minutes', value: 45, icon: 'pi-clock' },
  { label: '60 minutes', value: 60, icon: 'pi-clock' },
  { label: '90 minutes', value: 90, icon: 'pi-clock' },
  { label: '2 hours', value: 120, icon: 'pi-clock' },
]

// Fetch plans on mount
onMounted(async () => {
  await plansStore.fetchPlans()
})

const signOut = async () => {
  await supabase.auth.signOut()
  await navigateTo('/login')
}

function getCurrentWeek(): number {
  // TODO: Calculate based on plan start date
  // For now, return 1
  return 1
}

function getTodayDayKey(): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  return days[new Date().getDay()] || 'Mon'
}

function getTodayPlan(): { modality: string; focus?: string } | null {
  if (!plansStore.activePlan) return null

  const week = `week${getCurrentWeek()}`
  const day = getTodayDayKey()
  const schedule = plansStore.activePlan.weeklySchedule as Record<
    string,
    Record<string, string | { modality: string; focus?: string }>
  >
  const dayPlan = schedule[week]?.[day]

  if (!dayPlan) return null
  if (typeof dayPlan === 'string') {
    return { modality: dayPlan }
  }
  return dayPlan
}

function isTodayRestDay(): boolean {
  const plan = getTodayPlan()
  return plan?.modality.toLowerCase() === 'rest'
}

function getTodayLabel(): string {
  const plan = getTodayPlan()
  if (!plan) return 'No workout scheduled'
  if (isTodayRestDay()) return 'Rest Day'

  const label = `Today: ${plan.modality}`
  return plan.focus ? `${label} - ${plan.focus}` : label
}

function getTodayDescription(): string {
  const plan = getTodayPlan()
  if (!plan) return 'Check your plan for details'

  const normalized = plan.modality.toLowerCase()
  const descriptions: Record<string, string> = {
    strength: 'Resistance training session',
    cardio: 'Cardiovascular endurance training',
    hiit: 'High-intensity interval training',
    crossfit: 'Functional fitness workout',
    rehab: 'Recovery and rehabilitation exercises',
    rest: 'Rest and recovery day',
  }

  return descriptions[normalized] || 'Workout session'
}

function getSkipReasonLabel(reason?: string): string {
  const labels: Record<string, string> = {
    rest_day: 'Taking a rest day',
    holiday: 'On holiday',
    sick: 'Feeling unwell',
    injury: 'Dealing with injury',
    busy: 'Too busy today',
    other: 'Skipped',
  }
  return labels[reason || ''] || 'Skipped'
}

const checkingSession = ref(false)
const existingSession = ref<any>(null)

async function checkExistingSession() {
  if (!plansStore.activePlan) return

  try {
    const session = await sessionStore.fetchSessionByDay(
      plansStore.activePlan.id,
      getCurrentWeek(),
      getTodayDayKey()
    )
    existingSession.value = session
  } catch (error) {
    console.error('Error checking existing session:', error)
  }
}

// Watch for plan changes to re-check session
watch(
  () => plansStore.activePlan,
  async (newPlan) => {
    if (newPlan) {
      await checkExistingSession()
    }
  },
  { immediate: true }
)

// Check if existing session was skipped
const isSessionSkipped = computed(() => {
  return (
    existingSession.value?.status === 'cancelled' && existingSession.value?.feedback?.skipReason
  )
})

// Check if session can be continued (generated or in_progress)
const canContinueSession = computed(() => {
  return (
    existingSession.value &&
    (existingSession.value.status === 'generated' || existingSession.value.status === 'in_progress')
  )
})

async function handleStartTraining() {
  console.log('Start Training clicked')

  if (!plansStore.activePlan) {
    console.error('No active plan')
    return
  }

  const plan = getTodayPlan()

  if (!plan || isTodayRestDay()) {
    console.error('No modality or rest day')
    return
  }

  checkingSession.value = true
  try {
    // Check for existing session
    const existingSession = await sessionStore.fetchSessionByDay(
      plansStore.activePlan.id,
      getCurrentWeek(),
      getTodayDayKey()
    )

    if (existingSession) {
      console.log('Found existing session:', existingSession)
      // Set as current session
      sessionStore.currentSession = existingSession

      if (existingSession.status === 'generated') {
        // Resume generation flow - go to preview
        await router.push('/session/preview')
        return
      } else if (existingSession.status === 'in_progress') {
        // Resume training - go to companion
        await router.push('/session')
        return
      }
      // If completed or cancelled, we allow generating a new one (fall through)
    }
  } catch (error) {
    console.error('Error checking for existing session:', error)
    // Fall through to generator on error
  } finally {
    checkingSession.value = false
  }

  // Show session length dialog
  showSessionLengthDialog.value = true
}

async function confirmSessionLength() {
  if (!plansStore.activePlan) return

  const week = getCurrentWeek()
  const day = getTodayDayKey()
  const plan = getTodayPlan()

  if (!plan) return

  try {
    console.log('Generating session...', { sessionLength: selectedSessionLength.value })
    await sessionStore.generateSession(
      plansStore.activePlan.id,
      week,
      day,
      plan.modality,
      plan.focus,
      selectedSessionLength.value
    )

    console.log('Session generated, navigating...')
    // Close dialog after successful generation
    showSessionLengthDialog.value = false
    // Navigate to preview page to review and swap exercises
    await router.push('/session/preview')
  } catch (error: any) {
    console.error('Error generating session:', error)
    // Close dialog on error too
    showSessionLengthDialog.value = false
    toast.add({
      severity: 'error',
      summary: 'Generation Failed',
      detail: error.message || 'Failed to generate workout session',
    })
  }
}

async function handlePlanGenerated() {
  showGenerator.value = false
  await plansStore.fetchPlans()

  toast.add({
    severity: 'success',
    summary: 'Plan Generated!',
    detail: 'Your training plan is ready.',
  })
}

async function handleActivatePlan(planId: string) {
  try {
    await plansStore.setActivePlan(planId)
    showGenerator.value = false

    toast.add({
      severity: 'success',
      summary: 'Plan Activated',
      detail: 'This plan is now your active training plan.',
    })
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Activation Failed',
      detail: error.message || 'Failed to activate plan',
    })
  }
}

function handleViewPlan() {
  showGenerator.value = false
  router.push('/plans')
}

async function handleSkipSession(
  reason: 'rest_day' | 'holiday' | 'sick' | 'injury' | 'busy' | 'other',
  notes?: string
) {
  if (!existingSession.value) return

  skippingSession.value = true

  try {
    await sessionStore.skipSession(existingSession.value.id, reason, notes)

    toast.add({
      severity: 'info',
      summary: 'Workout Skipped',
      detail:
        reason === 'rest_day' ? 'Enjoy your rest day! 😴' : "No worries, we'll adjust your plan.",
    })

    // Clear existing session reference
    existingSession.value = null
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Failed to skip session',
    })
  } finally {
    skippingSession.value = false
    showSkipSessionDialog.value = false
  }
}
</script>

<template>
  <div class="home-container">
    <!-- Welcome Header -->
    <div class="welcome-header">
      <h1>Welcome Back!</h1>
      <p v-if="user" class="user-email">{{ user.email }}</p>
    </div>

    <!-- Active Plan Section -->
    <section v-if="plansStore.activePlan" class="start-training-section">
      <BaseCard class="training-card">
        <template #content>
          <div class="training-content">
            <!-- Week Badge -->
            <div class="week-badge">
              <i class="pi pi-calendar" />
              <span>Week {{ getCurrentWeek() }} of {{ plansStore.activePlan.durationWeeks }}</span>
            </div>

            <!-- Today's Focus -->
            <h2 class="today-heading">{{ getTodayLabel() }}</h2>
            <p class="today-description">{{ getTodayDescription() }}</p>

            <!-- Skipped Session State -->
            <div v-if="isSessionSkipped" class="skipped-state">
              <div class="skipped-badge">
                <span class="skipped-icon">⏭️</span>
                <span>Skipped</span>
              </div>
              <p class="skipped-reason">
                {{ getSkipReasonLabel(existingSession?.feedback?.skipReason) }}
                <template v-if="existingSession?.feedback?.skipNotes">
                  — {{ existingSession.feedback.skipNotes }}
                </template>
              </p>
              <BaseButton
                label="Start Anyway"
                severity="secondary"
                @click="handleStartTraining"
                :loading="sessionStore.generating || checkingSession"
                :disabled="sessionStore.generating || checkingSession"
                size="large"
                outlined
              />
            </div>

            <!-- Start Training Button -->
            <div v-else-if="!isTodayRestDay()" class="training-actions">
              <BaseButton
                :label="canContinueSession ? 'Continue Session' : 'Start Training'"
                :icon="canContinueSession ? 'pi pi-play' : 'pi pi-bolt'"
                @click="handleStartTraining"
                :loading="sessionStore.generating || checkingSession"
                :disabled="sessionStore.generating || checkingSession"
                size="large"
                class="start-button"
              />
              <BaseButton
                v-if="canContinueSession"
                label="Skip Today"
                severity="secondary"
                @click="showSkipSessionDialog = true"
                :disabled="sessionStore.generating || checkingSession"
                size="large"
                outlined
              />
            </div>

            <!-- Rest Day State -->
            <div v-else class="rest-day-state">
              <i class="pi pi-moon rest-icon" />
              <p>Your body needs recovery today</p>
            </div>

            <!-- Secondary Actions -->
            <div class="secondary-actions">
              <BaseButton label="View Full Plan" icon="📅" to="/plans" text size="small" />
              <BaseButton label="Manage Plans" icon="" to="/plans/library" text size="small" />
            </div>
          </div>
        </template>
      </BaseCard>
    </section>

    <!-- Loading State -->
    <section v-else-if="plansStore.loading" class="loading-section">
      <BaseCard>
        <template #content>
          <div class="loading-content">
            <BaseProgressSpinner />
            <p>Loading your training plan...</p>
          </div>
        </template>
      </BaseCard>
    </section>

    <!-- No Plan Section -->
    <section v-else class="no-plan-section">
      <BaseCard>
        <template #content>
          <div class="no-plan-content">
            <div class="no-plan-icon">
              <i class="pi pi-calendar" />
            </div>
            <h2>No Active Training Plan</h2>
            <p>Generate an AI-powered training plan to get started with your fitness journey.</p>
            <div class="no-plan-actions">
              <BaseButton
                label="Generate Plan"
                icon=""
                @click="showGenerator = true"
                size="large"
              />
              <BaseButton label="View Saved Plans" icon="" to="/plans" outlined />
            </div>
          </div>
        </template>
      </BaseCard>
    </section>

    <!-- Session Length Dialog -->
    <BaseDialog
      v-model:visible="showSessionLengthDialog"
      modal
      header="How long do you have?"
      :closable="!sessionStore.generating"
      :dismissableMask="!sessionStore.generating"
    >
      <div class="session-length-content">
        <p class="dialog-description">
          Choose your available workout time. We'll generate a session that fits perfectly.
        </p>

        <div class="length-options">
          <label :key="option.value" v-for="option in sessionLengthOptions">
            <input type="radio" v-model="selectedSessionLength" :value="option.value" />
            <span>{{ option.label }}</span>
          </label>
        </div>
      </div>

      <template #footer>
        <BaseButton
          label="Cancel"
          @click="showSessionLengthDialog = false"
          text
          :disabled="sessionStore.generating"
        />
        <BaseButton
          label="Generate Workout"
          icon=""
          @click="confirmSessionLength"
          :loading="sessionStore.generating"
        />
      </template>
    </BaseDialog>

    <!-- Plan Generator Dialog -->
    <BaseDialog
      v-model:visible="showGenerator"
      modal
      header="Generate Training Plan"
      class="generator-dialog"
    >
      <PlanGenerator
        @plan-generated="handlePlanGenerated"
        @activate-plan="handleActivatePlan"
        @view-plan="handleViewPlan"
        @cancel="showGenerator = false"
      />
    </BaseDialog>

    <!-- Skip Session Dialog -->
    <SkipSessionDialog
      v-model:visible="showSkipSessionDialog"
      :loading="skippingSession"
      @confirm="handleSkipSession"
      @cancel="showSkipSessionDialog = false"
    />

    <BasePageMessages />
  </div>
</template>

<style scoped>
.home-container {
  padding: var(--spacing-lg);
  max-width: 75rem;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.welcome-header {
  text-align: center;
  padding: var(--spacing-lg) 0;
}

.welcome-header h1 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 var(--spacing-sm) 0;
  color: var(--p-text-color);
}

.user-email {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.75);
  margin: 0;
}

/* Start Training Section */
.start-training-section {
  margin-bottom: var(--spacing-xl);
}

.training-card :deep(.p-card-content) {
  padding: var(--spacing-xl);
}

.training-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--spacing-lg);
}

.week-badge {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--p-surface-100);
  border-radius: var(--p-border-radius);
  font-size: 0.875rem;
  color: var(--p-text-muted-color);
}

.today-heading {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  color: var(--p-text-color);
}

.today-description {
  font-size: 1.125rem;
  color: var(--p-text-muted-color);
  margin: 0;
  max-width: 30rem;
}

.start-button {
  min-width: 15rem;
  height: 3.5rem;
  font-size: 1.125rem;
  font-weight: 600;
}

.training-actions {
  display: flex;
  gap: var(--spacing-md);
  flex-wrap: wrap;
  justify-content: center;
}

.rest-day-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-xl) 0;
}

.rest-icon {
  font-size: 3rem;
  color: var(--p-text-muted-color);
}

.rest-day-state p {
  font-size: 1rem;
  color: var(--p-text-muted-color);
  margin: 0;
}

/* Skipped Session State */
.skipped-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg) 0;
}

.skipped-badge {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--p-yellow-100);
  color: var(--p-yellow-700);
  border-radius: var(--p-border-radius);
  font-weight: 600;
  font-size: 0.875rem;
}

.skipped-icon {
  font-size: 1rem;
}

.skipped-reason {
  font-size: 0.9375rem;
  color: var(--p-text-muted-color);
  margin: 0;
  text-align: center;
  max-width: 25rem;
}

.secondary-actions {
  display: flex;
  gap: var(--spacing-md);
  flex-wrap: wrap;
  justify-content: center;
  margin-top: var(--spacing-md);
}

.no-plan-content,
.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: var(--spacing-xl);
  gap: var(--spacing-lg);
}

.no-plan-icon {
  font-size: 4rem;
  color: var(--p-text-muted-color);
}

.no-plan-content h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  color: var(--p-text-color);
}

.no-plan-content p {
  font-size: 1rem;
  color: var(--p-text-muted-color);
  margin: 0;
  max-width: 30rem;
}

.no-plan-actions {
  display: flex;
  gap: var(--spacing-md);
  flex-wrap: wrap;
  justify-content: center;
}
</style>
