<template>
  <BaseCard class="plan-card" :class="{ 'is-active': plan.isActive }">
    <template #header>
      <div class="card-header">
        <div class="plan-info">
          <h3 class="plan-name">{{ plan.name }}</h3>
          <BaseBadge v-if="plan.isActive" value="Active" severity="success" />
        </div>
        <div class="plan-meta">
          <span class="meta-item">
            <i class="pi pi-calendar" />
            {{ plan.durationWeeks }} weeks
          </span>
          <span class="meta-item">
            <i class="pi pi-clock" />
            {{ formatDate(plan.createdAt) }}
          </span>
        </div>
      </div>
    </template>

    <template #content>
      <div class="plan-schedule">
        <h4>Training Schedule</h4>
        <PlanWeekViewCards
          :weekly-schedule="
            plan.weeklySchedule as Record<string, Record<string, string | { modality: string }>>
          "
          :total-weeks="plan.durationWeeks"
          :initial-week="1"
          :plan-id="plan.id"
          :editable="plan.isActive"
        />
      </div>
    </template>

    <template #footer>
      <div class="card-actions">
        <BaseButton
          v-if="!plan.isActive"
          label="Set Active"
          icon=""
          @click="emit('set-active', plan.id)"
          size="small"
          outlined
        />
        <BaseButton
          v-if="plan.isActive"
          label="Deactivate"
          icon=""
          @click="emit('deactivate', plan.id)"
          size="small"
          outlined
          severity="secondary"
        />
        <BaseButton label="View Details" icon="👁️" @click="emit('view', plan)" size="small" text />
        <BaseButton
          v-if="!plan.isActive"
          icon="🗑️"
          @click="emit('delete', plan.id)"
          size="small"
          severity="danger"
          text
          aria-label="Delete plan"
        />
      </div>
    </template>
  </BaseCard>
</template>

<script setup lang="ts">
import type { TrainingPlan } from '../../../db/schema'
import PlanWeekViewCards from './PlanWeekViewCards.vue'

interface Props {
  plan: TrainingPlan
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'set-active': [planId: string]
  deactivate: [planId: string]
  view: [plan: TrainingPlan]
  delete: [planId: string]
}>()

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
</script>

<style scoped>
.plan-card {
  width: 100%;
  transition: all 0.2s ease;
}

.plan-card.is-active {
  border: 2px solid var(--p-primary-color);
}

.card-header {
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.plan-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-sm);
}

.plan-name {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: var(--p-text-color);
  flex: 1;
}

.plan-meta {
  display: flex;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.75);
}

.meta-item i {
  font-size: 0.875rem;
}

.plan-schedule {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.plan-schedule h4 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  color: var(--p-text-color);
}

.card-actions {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .plan-name {
    font-size: 1.125rem;
  }

  .card-actions {
    flex-direction: column;
    width: 100%;
  }

  .card-actions :deep(.p-button) {
    width: 100%;
    justify-content: center;
  }
}
</style>
