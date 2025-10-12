<template>
  <div class="onboarding-step">
    <h2 class="step-title">Any injuries or limitations?</h2>

    <form>
      <div class="field">
        <label class="field-label">
          <i class="pi pi-exclamation-triangle" style="color: var(--p-orange-500); margin-right: 0.5rem;"></i>
          Injury Flags (Optional)
        </label>
        <Textarea
          v-model="injuryFlags"
          :rows="3"
          :maxlength="300"
          placeholder="e.g., Lower back pain, right knee issues, shoulder mobility..."
          class="w-full"
        />
        <small class="char-count">{{ injuryFlags.length }}/300</small>
        <div class="help-text">
          <i class="pi pi-info-circle" style="margin-right: 0.25rem;"></i>
          <small>This helps the AI avoid exercises that may aggravate your condition</small>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
const onboardingStore = useOnboardingStore()

const injuryFlags = computed({
  get: () => onboardingStore.formData.injuryFlags || '',
  set: (value) => onboardingStore.updateFormData({ injuryFlags: value }),
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
  display: flex;
  align-items: center;
}

.w-full {
  width: 100%;
}

.char-count {
  display: block;
  text-align: right;
  color: var(--p-text-muted-color);
  font-size: 0.875rem;
  margin-top: 0.5rem;
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
