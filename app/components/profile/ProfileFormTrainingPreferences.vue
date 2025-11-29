<template>
  <div class="form-section">
    <h3 v-if="showTitle" class="section-title">
      <i class="pi pi-bolt" />
      Training Preferences
    </h3>

    <div class="form-grid">
      <div class="field">
        <label class="field-label">Experience Level</label>
        <BaseSelect
          :modelValue="modelValue.experienceLevel"
          @update:modelValue="updateField('experienceLevel', $event)"
          :options="experienceLevelOptions"
          optionLabel="label"
          optionValue="value"
          class="w-full"
        />
      </div>

      <div class="field">
        <label class="field-label">Progression Pace</label>
        <BaseSelect
          :modelValue="modelValue.aggressiveness"
          @update:modelValue="updateField('aggressiveness', $event)"
          :options="aggressivenessOptions"
          optionLabel="label"
          optionValue="value"
          class="w-full"
        />
      </div>
    </div>

    <div class="field mt-4">
      <label class="field-label">Preferred Training Days</label>
      <CheckboxGroup
        :modelValue="modelValue.preferredTrainingDays"
        @update:modelValue="updateField('preferredTrainingDays', $event)"
        :options="dayOptions"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import CheckboxGroup from '~/components/form/CheckboxGroup.vue'

export interface TrainingPreferencesData {
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced'
  aggressiveness?: 'conservative' | 'moderate' | 'aggressive'
  preferredTrainingDays?: string[]
}

const props = withDefaults(
  defineProps<{
    modelValue: TrainingPreferencesData
    showTitle?: boolean
  }>(),
  {
    showTitle: true,
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: TrainingPreferencesData]
}>()

const experienceLevelOptions = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
]

const aggressivenessOptions = [
  { value: 'conservative', label: 'Conservative' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'aggressive', label: 'Aggressive' },
]

const dayOptions = [
  { value: 'Mon', label: 'Mon' },
  { value: 'Tue', label: 'Tue' },
  { value: 'Wed', label: 'Wed' },
  { value: 'Thu', label: 'Thu' },
  { value: 'Fri', label: 'Fri' },
  { value: 'Sat', label: 'Sat' },
  { value: 'Sun', label: 'Sun' },
]

function updateField(field: keyof TrainingPreferencesData, value: any) {
  emit('update:modelValue', {
    ...props.modelValue,
    [field]: value,
  })
}
</script>

<style scoped>
.form-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--p-text-color);
  margin: 0;
}

.section-title i {
  color: var(--p-primary-color);
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field-label {
  font-weight: 500;
  color: var(--p-text-color);
  font-size: 0.875rem;
}

.mt-4 {
  margin-top: 1rem;
}

.w-full {
  width: 100%;
}
</style>
