<template>
  <div class="profile-edit-form">
    <form @submit.prevent="handleSubmit">
      <!-- Section: Training Preferences -->
      <ProfileFormTrainingPreferences v-model="trainingPreferences" />

      <BaseDivider />

      <!-- Section: Goals -->
      <ProfileFormGoals v-model="formData.goals" />

      <BaseDivider />

      <!-- Section: Health & Safety -->
      <ProfileFormHealthSafety v-model="formData.injuryFlags" :goals="formData.goals" />

      <BaseDivider />

      <!-- Section: App Preferences -->
      <div class="form-section">
        <h3 class="section-title">
          <i class="pi pi-cog" />
          App Preferences
        </h3>
        <div class="form-grid">
          <div class="field">
            <label class="field-label">Units</label>
            <Select
              v-model="formData.units"
              :options="unitsOptions"
              optionLabel="label"
              optionValue="value"
              class="w-full"
            />
          </div>

          <div class="field">
            <label class="field-label">Language</label>
            <Select
              v-model="formData.language"
              :options="languageOptions"
              optionLabel="label"
              optionValue="value"
              class="w-full"
            />
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="form-actions">
        <BaseButton label="Cancel" severity="secondary" @click="$emit('cancel')" type="button" />
        <BaseButton label="Save Changes" :loading="loading" type="submit" />
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import type { ProfileFormData } from '~/stores/profile.store'
import ProfileFormTrainingPreferences from '~/components/profile/ProfileFormTrainingPreferences.vue'
import ProfileFormGoals from '~/components/profile/ProfileFormGoals.vue'
import ProfileFormHealthSafety from '~/components/profile/ProfileFormHealthSafety.vue'
import type { TrainingPreferencesData } from '~/components/profile/ProfileFormTrainingPreferences.vue'

const props = defineProps<{
  initialData: ProfileFormData
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'save', data: ProfileFormData): void
  (e: 'cancel'): void
}>()

// Form Data
const formData = ref<ProfileFormData>({ ...props.initialData })

// Watch for changes in initialData (e.g. when loaded asynchronously)
watch(
  () => props.initialData,
  (newData) => {
    formData.value = { ...newData }
  },
  { deep: true }
)

// Computed property for training preferences to support v-model binding
const trainingPreferences = computed<TrainingPreferencesData>({
  get: () => ({
    experienceLevel: formData.value.experienceLevel,
    aggressiveness: formData.value.aggressiveness,
    preferredTrainingDays: formData.value.preferredTrainingDays,
  }),
  set: (value) => {
    formData.value.experienceLevel = value.experienceLevel
    formData.value.aggressiveness = value.aggressiveness
    formData.value.preferredTrainingDays = value.preferredTrainingDays
  },
})

// Options for App Preferences section
const unitsOptions = [
  { value: 'metric', label: 'Metric (kg/cm)' },
  { value: 'imperial', label: 'Imperial (lb/in)' },
]

const languageOptions = [{ value: 'en', label: 'English' }]

const handleSubmit = () => {
  emit('save', formData.value)
}
</script>

<style scoped>
.profile-edit-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

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

.required-indicator {
  color: var(--p-red-500);
  margin-left: 0.25rem;
}

.help-text,
.char-count {
  font-size: 0.75rem;
  color: var(--p-text-muted-color);
}

.help-text.emphasis {
  color: var(--p-primary-color);
  display: flex;
  align-items: center;
  gap: 0.375rem;
  margin-top: 0.25rem;
}

.char-count {
  text-align: right;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--p-surface-border);
}
</style>




