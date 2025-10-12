<template>
  <div class="onboarding-step">
    <h2 class="step-title">Let's get started!</h2>

    <form>
      <div class="field">
        <label class="field-label">Experience Level <span class="required">*</span></label>
        <FormRadioGroup v-model="experienceLevel" :options="experienceLevels" />
      </div>

      <div class="field">
        <label class="field-label">Preferred Training Days <span class="required">*</span></label>
        <FormCheckboxButtonGroup v-model="preferredTrainingDays" :options="dayOptions" />
        <small v-if="preferredTrainingDays.length === 0" class="error-text">
          Please select at least one training day
        </small>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
const onboardingStore = useOnboardingStore()

const experienceLevels = [
  { value: 'beginner', label: 'Beginner', description: 'New to training' },
  { value: 'intermediate', label: 'Intermediate', description: '6+ months experience' },
  { value: 'advanced', label: 'Advanced', description: '2+ years experience' },
]

const dayOptions = [
  { value: 'Mon', label: 'M' },
  { value: 'Tue', label: 'T' },
  { value: 'Wed', label: 'W' },
  { value: 'Thu', label: 'T' },
  { value: 'Fri', label: 'F' },
  { value: 'Sat', label: 'S' },
  { value: 'Sun', label: 'S' },
]

const experienceLevel = computed({
  get: () => onboardingStore.formData.experienceLevel || 'beginner',
  set: (value: string) =>
    onboardingStore.updateFormData({ experienceLevel: value as 'beginner' | 'intermediate' | 'advanced' }),
})

const preferredTrainingDays = computed({
  get: () => onboardingStore.formData.preferredTrainingDays || [],
  set: (value: string[]) => onboardingStore.updateFormData({ preferredTrainingDays: value }),
})
</script>

<style scoped>
.onboarding-step {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.step-title {
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 2rem;
  text-align: center;
  color: var(--p-text-color);
}

.field {
  margin-bottom: 2rem;
}

.field-label {
  display: block;
  margin-bottom: 0.75rem;
  font-weight: 500;
  font-size: 1rem;
  color: var(--p-text-color);
}

.required {
  color: var(--p-red-500);
}

.error-text {
  color: var(--p-red-500);
  font-size: 0.875rem;
  margin-top: 0.5rem;
  display: block;
}

@media (max-width: 768px) {
  .onboarding-step {
    padding: 1.5rem 0.75rem;
  }

  .step-title {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .field {
    margin-bottom: 1.5rem;
  }
}
</style>
