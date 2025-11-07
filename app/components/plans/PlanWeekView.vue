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

    <div class="week-schedule">
      <div
        v-for="item in currentWeekSchedule"
        :key="item.day"
        class="schedule-item"
        :class="{ 
          'is-rest': item.modality.toLowerCase() === 'rest',
          'is-today': item.isToday
        }"
      >
        <div class="day-header">
          <span class="day-name">{{ item.day }}</span>
          <Tag
            v-if="item.modality.toLowerCase() === 'rest'"
            value="Rest"
            severity="secondary"
          />
        </div>
        <div class="day-content">
          <span class="modality-text">{{ item.modality }}</span>
        </div>
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
    </div>

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
            <h4 class="suggestion-modality">{{ suggestion.modality }}</h4>
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
            placeholder="Select modality"
            class="modality-select"
          />
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
        <Button
          label="Save Changes"
          @click="saveChanges"
          :disabled="!canSave"
          :loading="saving"
        />
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
  weeklySchedule: Record<string, Record<string, string>>
  totalWeeks: number
  title?: string
  initialWeek?: number
  planId?: string
  editable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Training Schedule',
  initialWeek: 1,
  editable: false
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
  
  // Return ordered array of [day, modality] pairs
  return dayOrder
    .filter(day => schedule[day] !== undefined)
    .map(day => ({ 
      day, 
      modality: schedule[day] as string,
      isToday: day === currentDayName.value
    }))
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
watch(() => props.initialWeek, (newWeek) => {
  currentWeek.value = newWeek
})

// Edit functionality
const showEditDialog = ref(false)
const selectedDay = ref('')
const selectedModality = ref('')
const loadingSuggestions = ref(false)
const suggestionError = ref('')
const suggestions = ref<Array<{ modality: string; rationale: string; icon: string }>>([])
const selectedSuggestion = ref<number | null>(null)
const showManualSelection = ref(false)
const manualModality = ref('')
const saving = ref(false)

const modalityOptions = [
  'Pull',
  'Push',
  'Legs',
  'Upper',
  'Lower',
  'Full Body',
  'Cardio',
  'Rest'
]

const canSave = computed(() => {
  if (showManualSelection.value || suggestionError.value) {
    return manualModality.value !== ''
  }
  return selectedSuggestion.value !== null
})

async function openEditDialog(day: string, modality: string) {
  if (!props.planId) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Plan ID is required to edit',
      life: 3000
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
  manualModality.value = ''

  try {
    const weekKey = `week${currentWeek.value}`
    const result = await plansStore.generateDayPlanSuggestions(props.planId, weekKey, day)
    suggestions.value = result
  } catch (error: any) {
    console.error('Failed to generate suggestions:', error)
    suggestionError.value = error.message || 'Failed to generate AI suggestions. Please choose manually.'
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
  manualModality.value = ''
  suggestionError.value = ''
}

function quickSetRest() {
  if (showManualSelection.value || suggestionError.value) {
    manualModality.value = 'Rest'
  } else {
    // Find Rest suggestion or set manual
    const restIndex = suggestions.value.findIndex(s => s.modality.toLowerCase() === 'rest')
    if (restIndex !== -1) {
      selectedSuggestion.value = restIndex
    } else {
      showManualSelection.value = true
      manualModality.value = 'Rest'
    }
  }
}

async function saveChanges() {
  if (!props.planId || !canSave.value) return

  saving.value = true

  try {
    let newModality = ''
    
    if (showManualSelection.value || suggestionError.value) {
      newModality = manualModality.value
    } else if (selectedSuggestion.value !== null && suggestions.value[selectedSuggestion.value]) {
      newModality = suggestions.value[selectedSuggestion.value].modality
    }

    const weekKey = `week${currentWeek.value}`
    await plansStore.updatePlanDay(props.planId, weekKey, selectedDay.value, newModality)

    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: `${selectedDay.value} updated to ${newModality}`,
      life: 3000
    })

    closeEditDialog()
  } catch (error: any) {
    console.error('Failed to save changes:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Failed to update plan',
      life: 5000
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
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
  gap: var(--spacing-md);
}

.schedule-item {
  display: flex;
  flex-direction: column;
  padding: var(--spacing-md);
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  transition: all 0.2s ease;
}

.schedule-item:hover {
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
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

.day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
  padding-bottom: var(--spacing-sm);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.day-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.day-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-sm) 0;
}

.modality-text {
  font-size: 1rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.95);
  text-align: center;
  word-break: break-word;
}

.edit-button {
  margin-top: var(--spacing-sm);
  width: 100%;
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
