<template>
  <div class="onboarding-step">
    <h2 class="step-title">Personalize your training</h2>

    <form>
      <div class="field">
        <label class="field-label">Training Goals (Optional)</label>
        <FormChipGroup v-model="goals" :options="goalOptions" />
        <small class="help-text">Select all that apply</small>
      </div>

      <div class="field">
        <label class="field-label">Progression Pace</label>
        <Select
          v-model="aggressiveness"
          :options="aggressivenessOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Select progression pace"
          class="w-full"
        >
          <template #option="slotProps">
            <div class="option-content">
              <span class="option-label">{{ slotProps.option.label }}</span>
              <span class="option-desc">{{ slotProps.option.desc }}</span>
            </div>
          </template>
        </Select>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
const onboardingStore = useOnboardingStore()

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

const aggressivenessOptions = [
  { value: 'conservative', label: 'Conservative', desc: 'Slower, safer progression' },
  { value: 'moderate', label: 'Moderate', desc: 'Balanced approach (recommended)' },
  { value: 'aggressive', label: 'Aggressive', desc: 'Faster progression, more challenge' },
]

const goals = computed({
  get: () => onboardingStore.formData.goals || [],
  set: (value: string[]) => onboardingStore.updateFormData({ goals: value }),
})

const aggressiveness = computed({
  get: () => onboardingStore.formData.aggressiveness || 'moderate',
  set: (value) => onboardingStore.updateFormData({ aggressiveness: value }),
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

.w-full {
  width: 100%;
}

.help-text {
  display: block;
  text-align: center;
  color: var(--p-text-muted-color);
  font-size: 0.875rem;
  margin-top: 0.75rem;
}

.option-content {
  display: flex;
  flex-direction: column;
  padding: 0.5rem 0;
}

.option-label {
  font-weight: 600;
  font-size: 1rem;
}

.option-desc {
  font-size: 0.875rem;
  color: var(--p-text-muted-color);
  margin-top: 0.25rem;
}

@media (max-width: 768px) {
  .step-title {
    font-size: 1.5rem;
  }
}
</style>
