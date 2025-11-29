<template>
  <div class="plans-page">
    <div class="page-header">
      <h1>My Training Plan</h1>
      <div class="header-actions">
        <BaseButton
          label="Browse Plans"
          icon=""
          to="/plans/library"
          outlined
          :badge="plansStore.inactivePlans.length.toString()"
          v-if="plansStore.inactivePlans.length > 0"
        />
        <BaseButton
          label="Generate New Plan"
          icon=""
          @click="showGenerator = true"
          :disabled="plansStore.loading"
        />
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="plansStore.loading && !plansStore.plans.length" class="loading-state">
      <BaseProgressSpinner />
      <p>Loading your plans...</p>
    </div>

    <!-- Empty State - No Plans -->
    <div v-else-if="!plansStore.plans.length && !showGenerator" class="empty-state">
      <div class="empty-icon">
        <i class="pi pi-calendar" />
      </div>
      <h2>No Training Plans Yet</h2>
      <p>Generate your first AI-powered training plan to get started.</p>
      <BaseButton
        label="Generate Your First Plan"
        icon=""
        @click="showGenerator = true"
        size="large"
      />
    </div>

    <!-- Empty State - No Active Plan -->
    <div v-else-if="plansStore.plans.length && !plansStore.activePlan" class="empty-state">
      <div class="empty-icon">
        <i class="pi pi-calendar-times" />
      </div>
      <h2>No Active Plan</h2>
      <p>
        You have {{ plansStore.plans.length }} saved plan{{
          plansStore.plans.length > 1 ? 's' : ''
        }}. Set one as active or generate a new one.
      </p>
      <div class="empty-actions">
        <BaseButton label="Browse Saved Plans" icon="" to="/plans/library" size="large" />
        <BaseButton
          label="Generate New Plan"
          icon=""
          @click="showGenerator = true"
          size="large"
          outlined
        />
      </div>
    </div>

    <!-- Plan Generator Dialog -->
    <BaseDialog
      v-model:visible="showGenerator"
      modal
      :closable="true"
      :dismissableMask="false"
      class="generator-dialog"
      header="Generate Training Plan"
    >
      <PlanGenerator
        @plan-generated="handlePlanGenerated"
        @activate-plan="handleActivatePlan"
        @view-plan="handleViewPlan"
        @cancel="showGenerator = false"
      />
    </BaseDialog>

    <!-- Active Plan Display -->
    <div v-if="plansStore.activePlan" class="active-plan-content">
      <PlanCard
        :plan="plansStore.activePlan"
        @view="handleViewPlan"
        @deactivate="handleDeactivatePlan"
        @delete="handleDeletePlan"
      />
    </div>

    <!-- Plan Details Dialog -->
    <BaseDialog
      v-model:visible="showDetails"
      modal
      :closable="true"
      class="details-dialog"
      :header="selectedPlan?.name"
    >
      <div v-if="selectedPlan" class="plan-details">
        <div class="details-meta">
          <div class="meta-row">
            <span class="label">Duration:</span>
            <span class="value">{{ selectedPlan.durationWeeks }} weeks</span>
          </div>
          <div class="meta-row">
            <span class="label">Created:</span>
            <span class="value">{{ formatDate(selectedPlan.createdAt) }}</span>
          </div>
          <div class="meta-row">
            <span class="label">Status:</span>
            <BaseBadge
              :value="selectedPlan.isActive ? 'Active' : 'Inactive'"
              :severity="selectedPlan.isActive ? 'success' : 'secondary'"
            />
          </div>
        </div>

        <BaseDivider />

        <PlanWeekView
          :weekly-schedule="
            selectedPlan.weeklySchedule as Record<
              string,
              Record<string, string | { modality: string }>
            >
          "
          :total-weeks="selectedPlan.durationWeeks"
          :plan-id="selectedPlan.id"
          :editable="true"
          title="Full Schedule"
        />
      </div>

      <template #footer>
        <div class="dialog-actions">
          <BaseButton
            v-if="!selectedPlan?.isActive"
            label="Set as Active"
            icon=""
            @click="handleActivatePlan(selectedPlan!.id)"
          />
          <BaseButton label="Close" @click="showDetails = false" outlined />
        </div>
      </template>
    </BaseDialog>

    <!-- Delete Confirmation Dialog -->
    <BaseDialog
      v-model:visible="showDeleteConfirm"
      modal
      header="Delete Training Plan"
      class="delete-dialog"
    >
      <div class="delete-content">
        <i class="pi pi-exclamation-triangle delete-icon" />
        <p>Are you sure you want to delete this training plan? This action cannot be undone.</p>
      </div>

      <template #footer>
        <BaseButton label="Cancel" @click="showDeleteConfirm = false" outlined />
        <BaseButton
          label="Delete"
          severity="danger"
          @click="confirmDelete"
          :loading="plansStore.loading"
        />
      </template>
    </BaseDialog>

    <BasePageMessages />
  </div>
</template>

<script setup lang="ts">
import { usePlansStore } from '~/stores/plans'
import type { TrainingPlan } from '../../../db/schema'

definePageMeta({
  middleware: 'auth',
})

const plansStore = usePlansStore()
const toast = useToast()

const showGenerator = ref(false)
const showDetails = ref(false)
const showDeleteConfirm = ref(false)
const selectedPlan = ref<TrainingPlan | null>(null)
const planToDelete = ref<string | null>(null)

// Fetch plans on mount
onMounted(async () => {
  await plansStore.fetchPlans()
})

function handlePlanGenerated(plan: TrainingPlan) {
  showGenerator.value = false
  toast.add({
    severity: 'success',
    summary: 'Plan Generated!',
    detail: 'Your training plan has been created successfully.',
  })
}

async function handleActivatePlan(planId: string) {
  try {
    await plansStore.setActivePlan(planId)
    showDetails.value = false
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

function handleViewPlan(plan: TrainingPlan) {
  selectedPlan.value = plan
  showDetails.value = true
}

async function handleDeactivatePlan(planId: string) {
  try {
    await plansStore.deactivatePlan(planId)

    toast.add({
      severity: 'success',
      summary: 'Plan Deactivated',
      detail: 'Training plan has been set to inactive.',
    })
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Deactivation Failed',
      detail: error.message || 'Failed to deactivate plan',
    })
  }
}

function handleDeletePlan(planId: string) {
  planToDelete.value = planId
  showDeleteConfirm.value = true
}

async function confirmDelete() {
  if (!planToDelete.value) return

  try {
    await plansStore.deletePlan(planToDelete.value)
    showDeleteConfirm.value = false
    planToDelete.value = null

    toast.add({
      severity: 'success',
      summary: 'Plan Deleted',
      detail: 'Training plan has been removed.',
    })
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Deletion Failed',
      detail: error.message || 'Failed to delete plan',
    })
  }
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}
</script>

<style scoped>
.plans-page {
  padding: var(--spacing-lg);
  max-width: 75rem;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.header-actions {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
}

.page-header h1 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  color: var(--p-text-color);
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
  text-align: center;
  min-height: 20rem;
}

.empty-icon {
  font-size: 4rem;
  color: rgba(255, 255, 255, 0.65);
  margin-bottom: var(--spacing-lg);
}

.empty-state h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 var(--spacing-sm) 0;
  color: var(--p-text-color);
}

.empty-state p {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.75);
  margin: 0 0 var(--spacing-lg) 0;
  max-width: 30rem;
}

.empty-actions {
  display: flex;
  gap: var(--spacing-md);
  flex-wrap: wrap;
  justify-content: center;
}

.active-plan-content {
  max-width: 50rem;
  margin: 0 auto;
}

.plan-details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.details-meta {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.meta-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) 0;
}

.meta-row .label {
  font-weight: 600;
  color: rgba(255, 255, 255, 0.75);
}

.meta-row .value {
  color: var(--p-text-color);
}

.dialog-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: flex-end;
}

.delete-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  text-align: center;
}

.delete-icon {
  font-size: 3rem;
  color: var(--p-red-500);
}

.delete-content p {
  font-size: 1rem;
  color: var(--p-text-color);
  margin: 0;
  max-width: 25rem;
}

:deep(.generator-dialog),
:deep(.details-dialog),
:deep(.delete-dialog) {
  max-width: 90vw;
  width: 40rem;
}

@media (max-width: 768px) {
  .plans-page {
    padding: var(--spacing-md);
  }

  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .page-header h1 {
    font-size: 1.5rem;
  }

  .page-header :deep(.p-button) {
    width: 100%;
  }

  .plans-grid {
    grid-template-columns: 1fr;
  }

  :deep(.generator-dialog),
  :deep(.details-dialog),
  :deep(.delete-dialog) {
    width: 95vw;
  }

  .dialog-actions {
    flex-direction: column;
    width: 100%;
  }

  .dialog-actions :deep(.p-button) {
    width: 100%;
  }
}
</style>
