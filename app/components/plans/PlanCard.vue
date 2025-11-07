<template>
  <Card class="plan-card" :class="{ 'is-active': plan.isActive }">
    <template #header>
      <div class="card-header">
        <div class="plan-info">
          <h3 class="plan-name">{{ plan.name }}</h3>
          <Badge v-if="plan.isActive" value="Active" severity="success" />
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
        <div class="schedule-preview">
          <div
            v-for="(modality, day) in getFirstWeekSchedule()"
            :key="day"
            class="schedule-item"
            :class="{ 'is-rest': modality.toLowerCase() === 'rest' }"
          >
            <span class="day">{{ day }}</span>
            <span class="modality">{{ modality }}</span>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="card-actions">
        <Button
          v-if="!plan.isActive"
          label="Set Active"
          icon="pi pi-check"
          @click="emit('set-active', plan.id)"
          size="small"
          outlined
        />
        <Button
          label="View Details"
          icon="pi pi-eye"
          @click="emit('view', plan)"
          size="small"
          text
        />
        <Button
          v-if="!plan.isActive"
          icon="pi pi-trash"
          @click="emit('delete', plan.id)"
          size="small"
          severity="danger"
          text
          aria-label="Delete plan"
        />
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import type { TrainingPlan } from '~/db/schema'

interface Props {
  plan: TrainingPlan
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'set-active': [planId: string]
  'view': [plan: TrainingPlan]
  'delete': [planId: string]
}>()

const dayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function getFirstWeekSchedule() {
  const schedule = props.plan.weeklySchedule as Record<string, Record<string, string>>
  const week1 = schedule.week1 || {}
  
  // Return ordered array of [day, modality] pairs
  const orderedSchedule: Record<string, string> = {}
  dayOrder.forEach(day => {
    if (week1[day]) {
      orderedSchedule[day] = week1[day]
    }
  })
  
  return orderedSchedule
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
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

.schedule-preview {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(5rem, 1fr));
  gap: var(--spacing-sm);
}

.schedule-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm);
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  text-align: center;
}

.schedule-item.is-rest {
  opacity: 0.6;
}

.schedule-item .day {
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
  text-transform: uppercase;
}

.schedule-item .modality {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.95);
  word-break: break-word;
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

  .schedule-preview {
    grid-template-columns: repeat(auto-fill, minmax(4rem, 1fr));
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
