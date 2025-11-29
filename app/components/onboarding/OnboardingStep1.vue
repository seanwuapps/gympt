<template>
  <div class="onboarding-step">
    <h2 class="step-title">Let's get started!</h2>

    <form>
      <ProfileFormTrainingPreferences v-model="trainingPreferences" :showTitle="false" />

      <small v-if="preferredTrainingDays.length === 0" class="error-text">
        Please select at least one training day
      </small>
    </form>
  </div>
</template>

<script setup lang="ts">
import ProfileFormTrainingPreferences from '~/components/profile/ProfileFormTrainingPreferences.vue'
import type { TrainingPreferencesData } from '~/components/profile/ProfileFormTrainingPreferences.vue'

const onboardingStore = useOnboardingStore()

const trainingPreferences = computed<TrainingPreferencesData>({
  get: () => ({
    experienceLevel: onboardingStore.formData.experienceLevel || 'beginner',
    aggressiveness: onboardingStore.formData.aggressiveness || 'moderate',
    preferredTrainingDays: onboardingStore.formData.preferredTrainingDays || [],
  }),
  set: (value) => {
    onboardingStore.updateFormData(value)
  },
})

const preferredTrainingDays = computed(() => onboardingStore.formData.preferredTrainingDays || [])
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
}
</style>




