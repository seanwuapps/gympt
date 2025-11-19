<template>
  <div class="profile-edit-form">
    <form @submit.prevent="handleSubmit">
      <!-- Section: Training Preferences -->
      <div class="form-section">
        <h3 class="section-title">
          <i class="pi pi-bolt" />
          Training Preferences
        </h3>

        <div class="form-grid">
          <div class="field">
            <label class="field-label">Experience Level</label>
            <Select
              v-model="formData.experienceLevel"
              :options="experienceLevelOptions"
              optionLabel="label"
              optionValue="value"
              class="w-full"
            />
          </div>

          <div class="field">
            <label class="field-label">Progression Pace</label>
            <Select
              v-model="formData.aggressiveness"
              :options="aggressivenessOptions"
              optionLabel="label"
              optionValue="value"
              class="w-full"
            />
          </div>
        </div>

        <div class="field mt-4">
          <label class="field-label">Preferred Training Days</label>
          <CheckboxGroup v-model="formData.preferredTrainingDays" :options="dayOptions" />
        </div>
      </div>

      <Divider />

      <!-- Section: Goals -->
      <div class="form-section">
        <h3 class="section-title">
          <i class="pi pi-target" />
          Goals
        </h3>
        <div class="field">
          <CheckboxGroup v-model="formData.goals" :options="goalOptions" />
          <small class="help-text">Select all that apply</small>
        </div>
      </div>

      <Divider />

      <!-- Section: Health & Safety -->
      <div class="form-section">
        <h3 class="section-title">
          <i class="pi pi-heart" />
          Health & Safety
        </h3>
        <div class="field">
          <label class="field-label">Injury Flags / Limitations</label>
          <Textarea
            v-model="formData.injuryFlags"
            :rows="3"
            :maxlength="300"
            class="w-full"
            placeholder="Describe any injuries or exercises to avoid..."
          />
          <small class="char-count">{{ (formData.injuryFlags || '').length }}/300</small>
        </div>
      </div>

      <Divider />

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
        <Button label="Cancel" severity="secondary" @click="$emit('cancel')" type="button" />
        <Button label="Save Changes" :loading="loading" type="submit" />
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import type { ProfileFormData } from '~/composables/useProfile'
import CheckboxGroup from '~/components/form/CheckboxGroup.vue'

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

// Options (moved from profile.vue)
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

const unitsOptions = [
  { value: 'metric', label: 'Metric (kg/cm)' },
  { value: 'imperial', label: 'Imperial (lb/in)' },
]

const languageOptions = [{ value: 'en', label: 'English' }]

const dayOptions = [
  { value: 'Mon', label: 'Mon' },
  { value: 'Tue', label: 'Tue' },
  { value: 'Wed', label: 'Wed' },
  { value: 'Thu', label: 'Thu' },
  { value: 'Fri', label: 'Fri' },
  { value: 'Sat', label: 'Sat' },
  { value: 'Sun', label: 'Sun' },
]

const goalOptions = [
  { value: 'strength', label: 'Build Strength', icon: '💪' },
  { value: 'muscle', label: 'Gain Muscle', icon: '🏋️' },
  { value: 'weight_loss', label: 'Lose Weight', icon: '⚖️' },
  { value: 'endurance', label: 'Improve Endurance', icon: '🏃' },
  { value: 'flexibility', label: 'Increase Flexibility', icon: '🧘' },
  { value: 'athletic', label: 'Athletic Performance', icon: '⚡' },
  { value: 'health', label: 'General Health', icon: '❤️' },
  { value: 'rehab', label: 'Rehabilitation', icon: '🩹' },
]

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

.help-text,
.char-count {
  font-size: 0.75rem;
  color: var(--p-text-muted-color);
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
