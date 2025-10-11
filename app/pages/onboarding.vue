<template>
  <div class="onboarding-container">
    <el-card class="onboarding-card">
      <el-steps :active="onboardingStore.currentStep" finish-status="success" align-center>
        <el-step title="Basics" />
        <el-step title="Goals" />
        <el-step title="Safety" />
      </el-steps>

      <div class="step-content">
        <OnboardingStep1 v-if="onboardingStore.currentStep === 0" />
        <OnboardingStep2 v-if="onboardingStore.currentStep === 1" />
        <OnboardingStep3 v-if="onboardingStore.currentStep === 2" />
      </div>

      <div class="step-actions">
        <el-button v-if="onboardingStore.currentStep > 0" @click="handleBack">
          Back
        </el-button>
        <div class="spacer" />
        <el-button
          v-if="onboardingStore.currentStep < 2"
          type="primary"
          :disabled="!canProceed"
          @click="handleNext"
        >
          Next
        </el-button>
        <el-button
          v-if="onboardingStore.currentStep === 2"
          type="primary"
          :loading="saving"
          @click="handleComplete"
        >
          Complete Setup
        </el-button>
      </div>

      <div class="step-indicator">
        Step {{ onboardingStore.currentStep + 1 }} of 3
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ElNotification } from 'element-plus'
import type { ProfileFormData } from '~/composables/useProfile'

definePageMeta({
  middleware: 'auth',
})

const router = useRouter()
const { saveProfile } = useProfile()
const onboardingStore = useOnboardingStore()

const saving = ref(false)

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

    ElNotification({
      title: 'Profile Created!',
      message: 'Your training profile has been saved successfully.',
      type: 'success',
      duration: 3000,
    })

    // Redirect to home
    await router.push('/')
  } catch (error: any) {
    ElNotification({
      title: 'Error',
      message: error.message || 'Failed to save profile. Please try again.',
      type: 'error',
      duration: 5000,
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
  background: var(--el-bg-color-page);
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
  border-top: 1px solid var(--el-border-color);
}

.spacer {
  flex: 1;
}

.step-indicator {
  text-align: center;
  color: var(--el-text-color-secondary);
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
