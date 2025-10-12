<template>
  <div class="onboarding-step">
    <h2 class="step-title">Let's get started!</h2>

    <form>
      <div class="field">
        <label class="field-label">Experience Level <span class="required">*</span></label>
        <div class="experience-selector">
          <div 
            v-for="level in experienceLevels" 
            :key="level.value"
            class="radio-option"
            :class="{ 'selected': experienceLevel === level.value }"
            @click="experienceLevel = level.value"
          >
            <RadioButton 
              v-model="experienceLevel" 
              :inputId="level.value" 
              :value="level.value" 
            />
            <label :for="level.value" class="radio-content">
              <span class="label">{{ level.label }}</span>
              <span class="desc">{{ level.desc }}</span>
            </label>
          </div>
        </div>
      </div>

      <div class="field">
        <label class="field-label">Preferred Training Days <span class="required">*</span></label>
        <div class="day-selector">
          <div 
            v-for="day in days" 
            :key="day"
            class="day-button"
            :class="{ 'selected': preferredTrainingDays.includes(day) }"
          >
            <Checkbox 
              v-model="preferredTrainingDays" 
              :inputId="day" 
              :value="day"
            />
            <label :for="day" class="day-label">{{ day.charAt(0) }}</label>
          </div>
        </div>
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
  { value: 'beginner' as const, label: 'Beginner', desc: 'New to training' },
  { value: 'intermediate' as const, label: 'Intermediate', desc: '6+ months experience' },
  { value: 'advanced' as const, label: 'Advanced', desc: '2+ years experience' },
]

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const experienceLevel = computed({
  get: () => onboardingStore.formData.experienceLevel || 'beginner',
  set: (value: 'beginner' | 'intermediate' | 'advanced') => onboardingStore.updateFormData({ experienceLevel: value }),
})

const preferredTrainingDays = computed({
  get: () => onboardingStore.formData.preferredTrainingDays || [],
  set: (value) => onboardingStore.updateFormData({ preferredTrainingDays: value }),
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
}

.field {
  margin-bottom: 2rem;
}

.field-label {
  display: block;
  margin-bottom: 0.75rem;
  font-weight: 500;
  font-size: 1rem;
}

.required {
  color: var(--p-red-500);
}

.experience-selector {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.radio-option {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  border: 2px solid var(--p-surface-border);
  border-radius: var(--p-border-radius);
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.radio-option :deep(.p-radiobutton) {
  flex-shrink: 0;
}

.radio-option:hover {
  border-color: var(--p-primary-color);
  background: var(--p-surface-50);
}

.radio-option.selected {
  border-color: var(--p-primary-color);
  background: var(--p-primary-50);
}

.radio-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  cursor: pointer;
}

.radio-content .label {
  font-weight: 600;
  font-size: 1rem;
}

.radio-content .desc {
  font-size: 0.875rem;
  color: var(--p-text-muted-color);
  margin-top: 0.25rem;
}

.day-selector {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

.day-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border: 2px solid var(--p-surface-border);
  border-radius: 50%;
  min-width: 3rem;
  min-height: 3rem;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.day-button :deep(.p-checkbox) {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.day-button:hover {
  border-color: var(--p-primary-color);
  background: var(--p-surface-50);
}

.day-button.selected {
  border-color: var(--p-primary-color);
  background: var(--p-primary-50);
}

.day-label {
  cursor: pointer;
  font-weight: 600;
}

.error-text {
  color: var(--p-red-500);
  font-size: 0.875rem;
  margin-top: 0.5rem;
  display: block;
}

@media (max-width: 768px) {
  .step-title {
    font-size: 1.5rem;
  }
}
</style>
