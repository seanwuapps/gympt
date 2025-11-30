<template>
  <BaseDialog v-model:visible="visible" header="Skip Today's Workout?" class="skip-session-dialog">
    <div class="skip-content">
      <p class="skip-intro">
        No worries! Let us know why you're skipping so we can adjust your plan.
      </p>

      <!-- Reason Selection -->
      <div class="reason-section">
        <label class="section-label">Reason</label>
        <div class="reason-buttons">
          <button
            v-for="option in reasonOptions"
            :key="option.value"
            type="button"
            class="reason-btn"
            :class="{ selected: selectedReason === option.value }"
            @click="selectedReason = option.value"
          >
            <span class="reason-icon">{{ option.icon }}</span>
            <span class="reason-label">{{ option.label }}</span>
          </button>
        </div>
      </div>

      <!-- Notes -->
      <div class="notes-section">
        <label class="section-label">Notes (optional)</label>
        <textarea
          v-model="notes"
          placeholder="Any additional details..."
          rows="3"
          class="notes-input"
        />
      </div>
    </div>

    <template #footer>
      <BaseButton label="Cancel" text @click="handleCancel" />
      <BaseButton
        label="Skip Workout"
        severity="secondary"
        @click="handleConfirm"
        :disabled="!selectedReason"
        :loading="loading"
      />
    </template>
  </BaseDialog>
</template>

<script setup lang="ts">
interface Props {
  visible: boolean
  loading?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  confirm: [reason: 'rest_day' | 'holiday' | 'sick' | 'injury' | 'busy' | 'other', notes?: string]
  cancel: []
}>()

const visible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value),
})

const selectedReason = ref<'rest_day' | 'holiday' | 'sick' | 'injury' | 'busy' | 'other' | null>(
  null
)
const notes = ref('')

const reasonOptions = [
  { value: 'rest_day' as const, icon: '😴', label: 'Rest Day' },
  { value: 'holiday' as const, icon: '🏖️', label: 'Holiday' },
  { value: 'sick' as const, icon: '🤒', label: 'Feeling Sick' },
  { value: 'injury' as const, icon: '🤕', label: 'Injury' },
  { value: 'busy' as const, icon: '⏰', label: 'Too Busy' },
  { value: 'other' as const, icon: '📝', label: 'Other' },
]

function handleCancel() {
  emit('cancel')
  resetForm()
}

function handleConfirm() {
  if (!selectedReason.value) return
  emit('confirm', selectedReason.value, notes.value.trim() || undefined)
}

function resetForm() {
  selectedReason.value = null
  notes.value = ''
}

// Reset form when dialog closes
watch(
  () => props.visible,
  (newVal) => {
    if (!newVal) {
      resetForm()
    }
  }
)
</script>

<style scoped>
.skip-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.skip-intro {
  color: var(--p-text-muted-color);
  margin: 0;
  line-height: 1.5;
}

.section-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--p-text-muted-color);
  margin-bottom: var(--spacing-sm);
}

.reason-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-sm);
}

.reason-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-md);
  border: 2px solid var(--surface-border);
  border-radius: var(--border-radius);
  background: var(--surface-card);
  color: var(--p-text-color);
  cursor: pointer;
  transition: all 0.15s ease;
}

.reason-btn:hover {
  border-color: var(--p-primary-color);
}

.reason-btn.selected {
  background: var(--p-primary-color);
  border-color: var(--p-primary-color);
  color: white;
}

.reason-icon {
  font-size: 1.5rem;
}

.reason-label {
  font-size: 0.875rem;
  font-weight: 500;
}

.notes-input {
  width: 100%;
  padding: var(--spacing-md);
  border: 2px solid var(--surface-border);
  border-radius: var(--border-radius);
  background: var(--surface-card);
  color: var(--p-text-color);
  font-family: inherit;
  font-size: 1rem;
  resize: vertical;
}

.notes-input:focus {
  outline: none;
  border-color: var(--p-primary-color);
}

.notes-input::placeholder {
  color: var(--p-text-muted-color);
}

@media (max-width: 400px) {
  .reason-buttons {
    grid-template-columns: 1fr;
  }
}
</style>
