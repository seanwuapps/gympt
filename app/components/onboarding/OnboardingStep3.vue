<template>
  <div class="onboarding-step">
    <h2 class="step-title">Any injuries or limitations?</h2>

    <form>
      <ProfileFormHealthSafety v-model="injuryFlags" :goals="goals" :showTitle="false" />

      <div class="help-text">
        <i class="pi pi-info-circle" style="margin-right: 0.25rem"></i>
        <small>This helps the AI avoid exercises that may aggravate your condition</small>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import ProfileFormHealthSafety from '~/components/profile/ProfileFormHealthSafety.vue'

const onboardingStore = useOnboardingStore()

const injuryFlags = computed({
  get: () => onboardingStore.formData.injuryFlags || '',
  set: (value) => onboardingStore.updateFormData({ injuryFlags: value }),
})

const goals = computed(() => onboardingStore.formData.goals || [])
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

.help-text {
  margin-top: 0.75rem;
  padding: 0.75rem;
  background: var(--p-blue-50);
  border-radius: var(--p-border-radius);
  color: var(--p-text-color);
  font-size: 0.875rem;
  display: flex;
  align-items: flex-start;
}

@media (max-width: 768px) {
  .step-title {
    font-size: 1.5rem;
  }
}
</style>




