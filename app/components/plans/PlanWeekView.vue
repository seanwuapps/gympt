<template>
  <div class="plan-week-view">
    <div class="week-header">
      <h3>{{ title }}</h3>
      <div class="week-selector" v-if="totalWeeks > 1">
        <Button
          icon="pi pi-chevron-left"
          @click="previousWeek"
          :disabled="currentWeek === 1"
          text
          rounded
          size="small"
        />
        <span class="week-label">Week {{ currentWeek }} of {{ totalWeeks }}</span>
        <Button
          icon="pi pi-chevron-right"
          @click="nextWeek"
          :disabled="currentWeek === totalWeeks"
          text
          rounded
          size="small"
        />
      </div>
    </div>

    <ul class="week-schedule">
      <li
        v-for="item in currentWeekSchedule"
        :key="item.day"
        class="schedule-item"
        :class="{
          'is-rest': item.modality.toLowerCase() === 'rest',
          'is-today': item.isToday,
        }"
      >
        <div class="day-column">
          <span class="day-name">{{ item.day }}</span>
        </div>
        <div class="modality-column">
          <span class="modality-text">{{ item.modality }}</span>
        </div>
        <div class="focus-column">
          <span v-if="item.focus" class="focus-text">{{ item.focus }}</span>
          <span v-else class="focus-text empty">-</span>
        </div>
        <div class="actions-column">
          <Button
            v-if="editable"
            label="Change Day Plan"
            icon="pi pi-pencil"
            @click="openEditDialog(item.day, item.modality)"
            text
            size="small"
            class="edit-button"
          />
        </div>
      </li>
    </ul>

    <!-- AI Suggestions Dialog -->
    <Dialog
      v-model:visible="showEditDialog"
      modal
      :header="`Edit ${selectedDay} - ${selectedModality}`"
      :style="{ width: '90vw', maxWidth: '40rem' }"
    >
      <div class="edit-dialog-content">
        <!-- Loading State -->
        <div v-if="loadingSuggestions" class="loading-state">
          <ProgressSpinner style="width: 3rem; height: 3rem" />
          <p>Analyzing your plan...</p>
        </div>

        <!-- AI Suggestions -->
        <div v-else-if="suggestions.length > 0" class="suggestions-grid">
          <div
            v-for="(suggestion, index) in suggestions"
            :key="index"
            class="suggestion-card"
            :class="{ selected: selectedSuggestion === index }"
            @click="selectedSuggestion = index"
          >
            <div class="suggestion-icon">{{ suggestion.icon }}</div>
            <h4 class="suggestion-modality">
              {{ suggestion.modality }}
              <span v-if="suggestion.focus" class="suggestion-focus">- {{ suggestion.focus }}</span>
            </h4>
            <p class="suggestion-rationale">{{ suggestion.rationale }}</p>
          </div>
        </div>

        <!-- Error State with Manual Fallback -->
        <div v-else-if="suggestionError" class="error-state">
          <Message severity="warn" :closable="false">
            {{ suggestionError }}
          </Message>
          <p class="fallback-text">Choose manually instead:</p>
        </div>

        <!-- Manual Selection Fallback -->
        <div v-if="showManualSelection || suggestionError" class="manual-selection">
          <Select
            v-model="manualModality"
            :options="modalityOptions"
            placeholder="Select workout type"
            class="modality-select"
          >
            <template #option="{ option }">
              {{ option.modality }}<span v-if="option.focus"> - {{ option.focus }}</span>
            </template>
            <template #value="{ value, placeholder }">
              <template v-if="value"
                >{{ value.modality }}<span v-if="value.focus"> - {{ value.focus }}</span></template
              >
              <template v-else>{{ placeholder }}</template>
            </template>
          </Select>
        </div>

        <!-- Quick Actions -->
        <div class="quick-actions">
          <Button
            label="Mark as Rest"
            icon="pi pi-moon"
            @click="quickSetRest"
            outlined
            severity="secondary"
          />
          <Button
            v-if="!showManualSelection && !suggestionError"
            label="Choose Manually"
            icon="pi pi-list"
            @click="showManualSelection = true"
            outlined
          />
        </div>
      </div>

      <template #footer>
        <Button label="Keep Current" @click="closeEditDialog" text />
        <Button label="Save Changes" @click="saveChanges" :disabled="!canSave" :loading="saving" />
      </template>
    </Dialog>

    <!-- Toast for notifications -->
    <Toast />
  </div>
</template>

<script setup lang="ts">
import { usePlansStore } from '~/stores/plans'
import { useToast } from 'primevue/usetoast'

interface Props {
  weeklySchedule: Record<string, Record<string, string | { modality: string; focus?: string }>>
  totalWeeks: number
  title?: string
  initialWeek?: number
  planId?: string
  editable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Training Schedule',
  initialWeek: 1,
  editable: false,
})

const plansStore = usePlansStore()
const toast = useToast()

const currentWeek = ref(props.initialWeek)

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
  const schedule = props.weeklySchedule[`week${currentWeek.value}`] || {}

  // Return ordered array of day items with modality and focus
  return dayOrder
    .filter((day) => schedule[day] !== undefined)
    .map((day) => {
      const dayPlan = schedule[day]!
      const modality = typeof dayPlan === 'string' ? dayPlan : dayPlan.modality
      const focus = typeof dayPlan === 'string' ? undefined : dayPlan.focus

      return {
        day,
        modality,
        focus,
        isToday: day === currentDayName.value,
      }
    })
})

function nextWeek() {
  if (currentWeek.value < props.totalWeeks) {
    currentWeek.value++
  }
}

function previousWeek() {
  if (currentWeek.value > 1) {
    currentWeek.value--
  }
}

// Reset to initial week when prop changes
watch(
  () => props.initialWeek,
  (newWeek) => {
    currentWeek.value = newWeek
  }
)

// Edit functionality
const showEditDialog = ref(false)
const selectedDay = ref('')
const selectedModality = ref('')
const loadingSuggestions = ref(false)
const suggestionError = ref('')
const suggestions = ref<
  Array<{
    modality: string
    focus?: string
    rationale: string
    icon: string
  }>
>([])
const selectedSuggestion = ref<number | null>(null)
const showManualSelection = ref(false)
const manualModality = ref<{ modality: string; focus?: string } | null>(null)
const saving = ref(false)

const modalityOptions = [
  { modality: 'Strength', focus: 'Back' },
  { modality: 'Strength', focus: 'Biceps' },
  { modality: 'Strength', focus: 'Chest' },
  { modality: 'Strength', focus: 'Shoulders' },
  { modality: 'Strength', focus: 'Triceps' },
  { modality: 'Strength', focus: 'Quads' },
  { modality: 'Strength', focus: 'Hamstrings' },
  { modality: 'Strength', focus: 'Glutes' },
  { modality: 'Upper' },
  { modality: 'Lower' },
  { modality: 'Full Body' },
  { modality: 'Cardio', focus: 'HIIT' },
  { modality: 'Cardio', focus: 'Steady State' },
  { modality: 'Rest' },
]

const canSave = computed(() => {
  if (showManualSelection.value || suggestionError.value) {
    return manualModality.value !== null
  }
  return selectedSuggestion.value !== null
})

async function openEditDialog(day: string, modality: string) {
  if (!props.planId) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Plan ID is required to edit',
      life: 3000,
    })
    return
  }

  selectedDay.value = day
  selectedModality.value = modality
  showEditDialog.value = true
  loadingSuggestions.value = true
  suggestionError.value = ''
  suggestions.value = []
  selectedSuggestion.value = null
  showManualSelection.value = false
  manualModality.value = null

  try {
    const weekKey = `week${currentWeek.value}`
    const result = await plansStore.generateDayPlanSuggestions(props.planId, weekKey, day)
    suggestions.value = result
  } catch (error: any) {
    console.error('Failed to generate suggestions:', error)
    suggestionError.value =
      error.message || 'Failed to generate AI suggestions. Please choose manually.'
  } finally {
    loadingSuggestions.value = false
  }
}

function closeEditDialog() {
  showEditDialog.value = false
  selectedDay.value = ''
  selectedModality.value = ''
  suggestions.value = []
  selectedSuggestion.value = null
  showManualSelection.value = false
  manualModality.value = null
  suggestionError.value = ''
}

function quickSetRest() {
  if (showManualSelection.value || suggestionError.value) {
    manualModality.value = { modality: 'Rest' }
  } else {
    // Find Rest suggestion or set manual
    const restIndex = suggestions.value.findIndex((s) => s.modality.toLowerCase() === 'rest')
    if (restIndex !== -1) {
      selectedSuggestion.value = restIndex
    } else {
      showManualSelection.value = true
      manualModality.value = { modality: 'Rest' }
    }
  }
}

async function saveChanges() {
  if (!props.planId || !canSave.value) return

  saving.value = true

  try {
    let newModality = ''
    let newFocus: string | undefined = undefined

    if (showManualSelection.value || suggestionError.value) {
      if (manualModality.value) {
        newModality = manualModality.value.modality
        newFocus = manualModality.value.focus
      }
    } else if (selectedSuggestion.value !== null && suggestions.value[selectedSuggestion.value]) {
      const suggestion = suggestions.value[selectedSuggestion.value]!
      newModality = suggestion.modality
      newFocus = suggestion.focus
    }

    const weekKey = `week${currentWeek.value}`
    await plansStore.updatePlanDay(props.planId, weekKey, selectedDay.value, newModality, newFocus)

    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: `${selectedDay.value} updated to ${newModality}`,
      life: 3000,
    })

    closeEditDialog()
  } catch (error: any) {
    console.error('Failed to save changes:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Failed to update plan',
      life: 5000,
    })
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.plan-week-view {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.week-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.week-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: var(--p-text-color);
}

.week-selector {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.week-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.85);
  min-width: 8rem;
  text-align: center;
}

.week-schedule {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.schedule-item {
  display: grid;
  grid-template-columns: 4rem 1fr 1fr auto;
  gap: var(--spacing-md);
  align-items: center;
  padding: var(--spacing-md);
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  transition: all 0.2s ease;
}

.schedule-item:hover {
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.schedule-item.is-rest {
  opacity: 0.6;
}

.schedule-item.is-today {
  border-color: var(--p-primary-color);
  border-width: 2px;
  background: rgba(212, 255, 0, 0.05);
  box-shadow: 0 0 0 1px rgba(212, 255, 0, 0.2);
}

.schedule-item.is-today .day-name {
  color: var(--p-primary-color);
  font-weight: 700;
}

.day-column {
  display: flex;
  align-items: center;
}

.day-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.modality-column {
  display: flex;
  align-items: center;
}

.modality-text {
  font-size: 0.95rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.95);
  text-transform: capitalize;
}

.focus-column {
  display: flex;
  align-items: center;
}

.focus-text {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.75);
  text-transform: capitalize;
}

.focus-text.empty {
  opacity: 0.4;
}

.actions-column {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

/* Edit Dialog Styles */
.edit-dialog-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  min-height: 15rem;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  padding: var(--spacing-xl);
  color: rgba(255, 255, 255, 0.85);
}

.suggestions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
  gap: var(--spacing-md);
}

.suggestion-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.suggestion-card:hover {
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-0.125rem);
}

.suggestion-card.selected {
  border-color: var(--p-primary-color);
  background: rgba(212, 255, 0, 0.1);
}

.suggestion-focus {
  font-weight: 400;
  color: var(--p-text-muted-color);
  margin-left: 0.25rem;
}

.suggestion-icon {
  font-size: 2rem;
  line-height: 1;
}

.suggestion-modality {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  color: rgba(255, 255, 255, 0.95);
}

.suggestion-rationale {
  font-size: 0.875rem;
  margin: 0;
  color: rgba(255, 255, 255, 0.75);
  line-height: 1.4;
}

.error-state {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.fallback-text {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.85);
  margin: 0;
}

.manual-selection {
  width: 100%;
}

.modality-select {
  width: 100%;
}

.quick-actions {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.quick-actions button {
  flex: 1;
  min-width: 10rem;
}

@media (max-width: 768px) {
  .week-schedule {
    grid-template-columns: repeat(auto-fill, minmax(8rem, 1fr));
    gap: var(--spacing-sm);
  }

  .schedule-item {
    padding: var(--spacing-sm);
  }

  .week-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .week-selector {
    width: 100%;
    justify-content: center;
  }

  .suggestions-grid {
    grid-template-columns: 1fr;
  }

  .quick-actions button {
    min-width: 100%;
  }
}
</style>
