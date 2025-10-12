<template>
  <div class="onboarding-container">
    <Card class="onboarding-card">
      <template #header>
        <Steps :model="stepItems" :activeStep="onboardingStore.currentStep" />
      </template>

      <template #content>
        <div class="step-content">
          <OnboardingStep1 v-if="onboardingStore.currentStep === 0" />
          <OnboardingStep2 v-if="onboardingStore.currentStep === 1" />
          <OnboardingStep3 v-if="onboardingStore.currentStep === 2" />
        </div>
      </template>

      <template #footer>
        <div class="step-actions">
          <Button
            v-if="onboardingStore.currentStep > 0"
            label="Back"
            severity="secondary"
            @click="handleBack"
          />
          <div class="spacer" />
          <Button
            v-if="onboardingStore.currentStep < 2"
            label="Next"
            :disabled="!canProceed"
            @click="handleNext"
          />
          <Button
            v-if="onboardingStore.currentStep === 2"
            label="Complete Setup"
            :loading="saving"
            @click="handleComplete"
          />
        </div>

        <div class="step-indicator">Step {{ onboardingStore.currentStep + 1 }} of 3</div>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import type { ProfileFormData } from '~/composables/useProfile'

definePageMeta({
  middleware: 'auth',
})

const router = useRouter()
const toast = useToast()
const { saveProfile } = useProfile()
const onboardingStore = useOnboardingStore()

const saving = ref(false)

const stepItems = ref([{ label: 'Basics' }, { label: 'Goals' }, { label: 'Safety' }])

// Load progress from localStorage on mount
onMounted(() => {
  onboardingStore.loadProgress()
})

const canProceed = computed(() => {
  if (onboardingStore.currentStep === 0) {
    return onboardingStore.canProceedStep1
  }
  return true // Steps 2 and 3 are optional
})

const handleNext = () => {
  if (canProceed.value) {
    onboardingStore.nextStep()
  }
}

const handleBack = () => {
  onboardingStore.previousStep()
}

const handleComplete = async () => {
  saving.value = true

  try {
    await saveProfile(onboardingStore.formData as ProfileFormData)
    onboardingStore.clearProgress()

    // Clear the profile check cache so middleware knows profile exists
    const hasProfile = useState<boolean | null>('user-has-profile')
    hasProfile.value = true

    toast.add({
      severity: 'success',
      summary: 'Profile Created!',
      detail: 'Your training profile has been saved successfully.',
      life: 3000,
    })

    // Redirect to home
    await router.push('/')
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.message || 'Failed to save profile. Please try again.',
      life: 5000,
    })
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.onboarding-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  background: var(--p-surface-ground);
}

.onboarding-card {
  width: 100%;
  max-width: 800px;
}

.step-content {
  min-height: 400px;
  padding: 2rem 0;
}

.step-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 0;
  border-top: 1px solid var(--p-surface-border);
}

.spacer {
  flex: 1;
}

.step-indicator {
  text-align: center;
  color: var(--p-text-muted-color);
  font-size: 0.875rem;
  margin-top: 1rem;
}

@media (max-width: 768px) {
  .onboarding-container {
    padding: 1rem 0.5rem;
  }

  .step-content {
    min-height: 350px;
    padding: 1rem 0;
  }
}
</style>
