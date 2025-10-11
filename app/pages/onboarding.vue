<template>
  <div class="onboarding-container">
    <el-card class="onboarding-card">
      <el-steps :active="currentStep" finish-status="success" align-center>
        <el-step title="Basics" />
        <el-step title="Goals" />
        <el-step title="Safety" />
      </el-steps>

      <div class="step-content">
        <OnboardingStep1
          v-if="currentStep === 0"
          ref="step1Ref"
          v-model="formData"
        />
        <OnboardingStep2
          v-if="currentStep === 1"
          ref="step2Ref"
          v-model="formData"
        />
        <OnboardingStep3
          v-if="currentStep === 2"
          ref="step3Ref"
          v-model="formData"
        />
      </div>

      <div class="step-actions">
        <el-button v-if="currentStep > 0" @click="handleBack">
          Back
        </el-button>
        <div class="spacer" />
        <el-button
          v-if="currentStep < 2"
          type="primary"
          :disabled="!canProceed"
          @click="handleNext"
        >
          Next
        </el-button>
        <el-button
          v-if="currentStep === 2"
          type="primary"
          :loading="saving"
          @click="handleComplete"
        >
          Complete Setup
        </el-button>
      </div>

      <div class="step-indicator">
        Step {{ currentStep + 1 }} of 3
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
const { saveProfile, saveProgressToLocalStorage, loadProgressFromLocalStorage, clearProgress } =
  useProfile()

const currentStep = ref(0)
const saving = ref(false)

const formData = ref<Partial<ProfileFormData>>({
  experienceLevel: 'beginner',
  preferredTrainingDays: ['Mon', 'Wed', 'Fri'],
  aggressiveness: 'moderate',
  units: 'metric',
  language: 'en',
})

const step1Ref = ref()
const step2Ref = ref()
const step3Ref = ref()

// Load progress from localStorage on mount
onMounted(() => {
  const progress = loadProgressFromLocalStorage()
  if (progress) {
    currentStep.value = progress.step
    formData.value = { ...formData.value, ...progress.data }
  }
})

// Save progress whenever form data or step changes
watch(
  [currentStep, formData],
  () => {
    saveProgressToLocalStorage(currentStep.value, formData.value)
  },
  { deep: true }
)

const canProceed = computed(() => {
  if (currentStep.value === 0) {
    return step1Ref.value?.validate?.() ?? false
  }
  return true // Steps 2 and 3 are optional
})

const handleNext = () => {
  if (canProceed.value) {
    currentStep.value++
  }
}

const handleBack = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const handleComplete = async () => {
  saving.value = true

  try {
    await saveProfile(formData.value as ProfileFormData)
    clearProgress()

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
