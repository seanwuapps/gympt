<template>
  <div class="plan-week-view-cards">
    <div class="schedule-cards">
      <div
        v-for="item in currentWeekSchedule"
        :key="item.day"
        class="schedule-card"
        :class="{ 
          'is-rest': item.modality.toLowerCase() === 'rest',
          'is-today': item.isToday
        }"
      >
        <span class="day">{{ item.day }}</span>
        <span class="modality">{{ item.modality }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  weeklySchedule: Record<string, Record<string, string>>
  totalWeeks: number
  initialWeek?: number
}

const props = withDefaults(defineProps<Props>(), {
  initialWeek: 1
})

const dayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// Get current day of week (0 = Sunday, 1 = Monday, etc.)
const currentDayOfWeek = computed(() => {
  const today = new Date()
  const dayIndex = today.getDay() // 0-6, Sunday = 0
  // Convert to our format: Mon = 0, Tue = 1, ..., Sun = 6
  return dayIndex === 0 ? 6 : dayIndex - 1
})

const currentDayName = computed(() => {
  return dayOrder[currentDayOfWeek.value]
})

const currentWeekSchedule = computed(() => {
  const schedule = props.weeklySchedule[`week${props.initialWeek}`] || {}
  
  // Return ordered array of day items
  return dayOrder
    .filter(day => schedule[day] !== undefined)
    .map(day => ({ 
      day, 
      modality: schedule[day] as string,
      isToday: day === currentDayName.value
    }))
})
</script>

<style scoped>
.plan-week-view-cards {
  width: 100%;
}

.schedule-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(5rem, 1fr));
  gap: var(--spacing-sm);
}

.schedule-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm);
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  text-align: center;
  transition: all 0.2s ease;
}

.schedule-card.is-rest {
  opacity: 0.6;
}

.schedule-card.is-today {
  border-color: var(--p-primary-color);
  border-width: 2px;
  background: rgba(212, 255, 0, 0.05);
  box-shadow: 0 0 0 1px rgba(212, 255, 0, 0.2);
}

.schedule-card.is-today .day {
  color: var(--p-primary-color);
  font-weight: 700;
}

.schedule-card .day {
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
  text-transform: uppercase;
}

.schedule-card .modality {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.95);
  word-break: break-word;
}

@media (max-width: 768px) {
  .schedule-cards {
    grid-template-columns: repeat(auto-fill, minmax(4rem, 1fr));
  }
}
</style>
