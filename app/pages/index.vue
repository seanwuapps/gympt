<script setup lang="ts">
import { usePlansStore } from '~/stores/plans'
import { useSessionStore } from '~/stores/session'

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
      life: 5000,
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
    life: 3000,
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
      life: 3000,
    })
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Activation Failed',
      detail: error.message || 'Failed to activate plan',
      life: 5000,
    })
  }
}

function handleViewPlan() {
  showGenerator.value = false
  router.push('/plans')
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
      <Card class="training-card">
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

            <!-- Start Training Button -->
            <Button
              v-if="!isTodayRestDay()"
              :label="existingSession ? 'Continue Session' : 'Start Training'"
              :icon="existingSession ? 'pi pi-play' : 'pi pi-bolt'"
              @click="handleStartTraining"
              :loading="sessionStore.generating || checkingSession"
              :disabled="sessionStore.generating || checkingSession"
              size="large"
              class="start-button"
            />

            <!-- Rest Day State -->
            <div v-else class="rest-day-state">
              <i class="pi pi-moon rest-icon" />
              <p>Your body needs recovery today</p>
            </div>

            <!-- Secondary Actions -->
            <div class="secondary-actions">
              <Button
                label="View Full Plan"
                icon="pi pi-calendar"
                @click="router.push('/plans')"
                text
                size="small"
              />
              <Button
                label="Manage Plans"
                icon="pi pi-cog"
                @click="router.push('/plans/library')"
                text
                size="small"
              />
            </div>
          </div>
        </template>
      </Card>
    </section>

    <!-- Loading State -->
    <section v-else-if="plansStore.loading" class="loading-section">
      <Card>
        <template #content>
          <div class="loading-content">
            <ProgressSpinner />
            <p>Loading your training plan...</p>
          </div>
        </template>
      </Card>
    </section>

    <!-- No Plan Section -->
    <section v-else class="no-plan-section">
      <Card>
        <template #content>
          <div class="no-plan-content">
            <div class="no-plan-icon">
              <i class="pi pi-calendar" />
            </div>
            <h2>No Active Training Plan</h2>
            <p>Generate an AI-powered training plan to get started with your fitness journey.</p>
            <div class="no-plan-actions">
              <Button
                label="Generate Plan"
                icon="pi pi-sparkles"
                @click="showGenerator = true"
                size="large"
              />
              <Button
                label="View Saved Plans"
                icon="pi pi-list"
                @click="router.push('/plans')"
                outlined
              />
            </div>
          </div>
        </template>
      </Card>
    </section>

    <!-- Session Length Dialog -->
    <Dialog
      v-model:visible="showSessionLengthDialog"
      modal
      header="How long do you have?"
      :style="{ width: '90vw', maxWidth: '28rem' }"
      :closable="!sessionStore.generating"
      :dismissableMask="!sessionStore.generating"
    >
      <div class="session-length-content">
        <p class="dialog-description">
          Choose your available workout time. We'll generate a session that fits perfectly.
        </p>

        <div class="length-options">
          <div
            v-for="option in sessionLengthOptions"
            :key="option.value"
            class="length-option"
            :class="{ selected: selectedSessionLength === option.value }"
            @click="selectedSessionLength = option.value"
            :style="{
              pointerEvents: sessionStore.generating ? 'none' : 'auto',
              opacity: sessionStore.generating ? 0.6 : 1,
            }"
          >
            <i :class="`pi ${option.icon}`" />
            <span>{{ option.label }}</span>
          </div>
        </div>
      </div>

      <template #footer>
        <Button
          label="Cancel"
          @click="showSessionLengthDialog = false"
          text
          :disabled="sessionStore.generating"
        />
        <Button
          label="Generate Workout"
          icon="pi pi-bolt"
          @click="confirmSessionLength"
          :loading="sessionStore.generating"
        />
      </template>
    </Dialog>

    <!-- Quick Actions -->
    <section class="quick-actions">
      <h2>Quick Actions</h2>
      <div class="actions-grid">
        <Card class="action-card" @click="router.push('/profile')">
          <template #content>
            <i class="pi pi-user action-icon" />
            <h3>My Profile</h3>
            <p>View and edit your training profile</p>
          </template>
        </Card>

        <Card class="action-card" @click="router.push('/plans')">
          <template #content>
            <i class="pi pi-calendar action-icon" />
            <h3>Manage Plans</h3>
            <p>View and manage your training plans</p>
          </template>
        </Card>

        <Card class="action-card" @click="signOut">
          <template #content>
            <i class="pi pi-sign-out action-icon" />
            <h3>Sign Out</h3>
            <p>Log out of your account</p>
          </template>
        </Card>
      </div>
    </section>

    <!-- Plan Generator Dialog -->
    <Dialog
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
    </Dialog>

    <Toast />
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

.quick-actions h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 var(--spacing-md) 0;
  color: var(--p-text-color);
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
  gap: var(--spacing-md);
}

.action-card {
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.action-card :deep(.p-card-content) {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-lg);
}

.action-icon {
  font-size: 2.5rem;
  color: var(--p-primary-color);
}

.action-card h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
  color: var(--p-text-color);
}

.action-card p {
  font-size: 0.875rem;
  color: var(--p-text-muted-color);
  margin: 0;
}

/* Session Length Dialog */
.session-length-content {
  padding: var(--spacing-md) 0;
}

.dialog-description {
  color: var(--p-text-muted-color);
  margin-bottom: var(--spacing-lg);
  text-align: center;
}

.length-options {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.length-option {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  border: 2px solid var(--p-surface-border);
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all 0.2s ease;
}

.length-option:hover {
  border-color: var(--p-primary-color);
  background: var(--p-surface-700);
}

.length-option.selected {
  border-color: var(--p-primary-color);
  background: var(--p-primary-800);
  font-weight: 600;
}

.length-option i {
  font-size: 1.25rem;
  color: var(--p-primary-color);
}

.length-option span {
  flex: 1;
  font-size: 1rem;
}

:deep(.generator-dialog) {
  max-width: 90vw;
  width: 40rem;
}

@media (max-width: 768px) {
  .home-container {
    padding: var(--spacing-md);
  }

  .welcome-header h1 {
    font-size: 1.5rem;
  }

  .actions-grid {
    grid-template-columns: 1fr;
  }

  .no-plan-actions {
    flex-direction: column;
    width: 100%;
  }

  .no-plan-actions :deep(.p-button) {
    width: 100%;
  }

  :deep(.generator-dialog) {
    width: 95vw;
  }
}
</style>
