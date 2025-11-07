<template>
  <div class="onboarding-step-4">
    <div class="step-header">
      <h2>Generate Your Training Plan</h2>
      <p class="step-description">
        Based on your profile, we'll create a personalized multi-week training plan tailored to your goals and schedule.
      </p>
    </div>

    <div class="plan-generator-wrapper">
      <PlanGenerator
        @plan-generated="handlePlanGenerated"
        @activate-plan="handleActivatePlan"
        @view-plan="handleViewPlan"
        @cancel="emit('skip')"
      />
    </div>

    <div class="skip-section">
      <Button
        label="Skip for Now"
        @click="emit('skip')"
        text
        size="small"
      />
      <p class="skip-note">You can generate a plan anytime from your home page</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePlansStore } from '~/stores/plans'
import type { TrainingPlan } from '~/db/schema'

const emit = defineEmits<{
  'plan-generated': []
  'skip': []
}>()

const plansStore = usePlansStore()

async function handlePlanGenerated(plan: TrainingPlan) {
  // Auto-activate the first plan generated during onboarding
  try {
    await plansStore.setActivePlan(plan.id)
    emit('plan-generated')
  } catch (error) {
    console.error('Failed to activate plan:', error)
    // Still emit success even if activation fails
    emit('plan-generated')
  }
}

function handleActivatePlan(planId: string) {
  // Plan is already activated in handlePlanGenerated
  emit('plan-generated')
}

function handleViewPlan(plan: TrainingPlan) {
  // Just complete onboarding, user can view details on home page
  emit('plan-generated')
}
</script>

<style scoped>
.onboarding-step-4 {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.step-header {
  text-align: center;
}

.step-header h2 {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 var(--spacing-md) 0;
  color: var(--p-text-color);
}

.step-description {
  font-size: 1rem;
  color: var(--p-text-muted-color);
  margin: 0;
  max-width: 40rem;
  margin-left: auto;
  margin-right: auto;
}

.plan-generator-wrapper {
  display: flex;
  justify-content: center;
  padding: var(--spacing-lg) 0;
}

.skip-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--p-surface-border);
}

.skip-note {
  font-size: 0.875rem;
  color: var(--p-text-muted-color);
  margin: 0;
}

@media (max-width: 768px) {
  .step-header h2 {
    font-size: 1.5rem;
  }

  .plan-generator-wrapper {
    padding: var(--spacing-md) 0;
  }
}
</style>
