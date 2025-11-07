<script setup lang="ts">
import { usePlansStore } from '~/stores/plans'

definePageMeta({
  middleware: 'auth',
})

const supabase = useSupabaseClient()
const user = useCurrentUser() // Supports both real and fake auth
const plansStore = usePlansStore()
const router = useRouter()

const showGenerator = ref(false)

// Fetch plans on mount
onMounted(async () => {
  await plansStore.fetchPlans()
})

const toast = useToast()

const signOut = async () => {
  const { clearFakeAuth } = useFakeAuth()
  
  // Clear fake auth if present
  clearFakeAuth()
  
  // Also sign out from Supabase if real user
  await supabase.auth.signOut()
  
  await navigateTo('/login')
}

function getCurrentWeek() {
  // Simple calculation - in production, track actual start date
  return 1
}

async function handlePlanGenerated() {
  showGenerator.value = false
  await plansStore.fetchPlans()
  
  toast.add({
    severity: 'success',
    summary: 'Plan Generated!',
    detail: 'Your training plan is ready.',
    life: 3000
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
      life: 3000
    })
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Activation Failed',
      detail: error.message || 'Failed to activate plan',
      life: 5000
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
    <section v-if="plansStore.activePlan" class="active-plan-section">
      <Card>
        <template #header>
          <div class="section-header">
            <h2>Your Active Plan</h2>
            <Button
              label="Manage Plans"
              icon="pi pi-cog"
              @click="router.push('/plans')"
              text
              size="small"
            />
          </div>
        </template>

        <template #content>
          <div class="plan-overview">
            <h3>{{ plansStore.activePlan.name }}</h3>
            <div class="plan-stats">
              <div class="stat-item">
                <i class="pi pi-calendar" />
                <span>Week {{ getCurrentWeek() }} of {{ plansStore.activePlan.durationWeeks }}</span>
              </div>
            </div>
          </div>

          <Divider />

          <PlanWeekView
            :weekly-schedule="plansStore.activePlan.weeklySchedule as Record<string, Record<string, string>>"
            :total-weeks="plansStore.activePlan.durationWeeks"
            :plan-id="plansStore.activePlan.id"
            :initial-week="getCurrentWeek()"
            :editable="true"
            title="This Week's Schedule"
          />
        </template>
      </Card>
    </section>

    <!-- No Plan Section -->
    <section v-else-if="!plansStore.loading" class="no-plan-section">
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

    <!-- Loading State -->
    <section v-if="plansStore.loading" class="loading-section">
      <Card>
        <template #content>
          <div class="loading-content">
            <ProgressSpinner />
            <p>Loading your training plan...</p>
          </div>
        </template>
      </Card>
    </section>

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

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
}

.section-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: var(--p-text-color);
}

.plan-overview {
  margin-bottom: var(--spacing-md);
}

.plan-overview h3 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 var(--spacing-md) 0;
  color: var(--p-text-color);
}

.plan-stats {
  display: flex;
  gap: var(--spacing-lg);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.75);
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
