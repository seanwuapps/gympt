<template>
  <div class="onboarding-step">
    <h2 class="step-title">Personalize your training</h2>

    <form>
      <ProfileFormGoals v-model="goals" :showTitle="false" />
    </form>
  </div>
</template>

<script setup lang="ts">
import ProfileFormGoals from '~/components/profile/ProfileFormGoals.vue'

const onboardingStore = useOnboardingStore()

const goals = computed({
  get: () => onboardingStore.formData.goals || [],
  set: (value: string[]) => onboardingStore.updateFormData({ goals: value }),
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

@media (max-width: 768px) {
  .step-title {
    font-size: 1.5rem;
  }
}
</style>
