import { defineStore } from 'pinia'
import type { ProfileFormData } from '~/stores/profile.store'

const STORAGE_KEY = 'gympt_onboarding_progress'

export const useOnboardingStore = defineStore('onboarding', () => {
  // State
  const currentStep = ref(0)
  const formData = ref<Partial<ProfileFormData>>({
    experienceLevel: 'beginner',
    preferredTrainingDays: ['Mon', 'Wed', 'Fri'],
    aggressiveness: 'moderate',
    units: 'metric',
    language: 'en',
  })

  // Computed
  const canProceedStep1 = computed(() => {
    return (
      formData.value.experienceLevel !== undefined &&
      (formData.value.preferredTrainingDays?.length ?? 0) > 0
    )
  })

  // Actions
  function setStep(step: number) {
    currentStep.value = step
    saveProgress()
  }

  function nextStep() {
    if (currentStep.value < 3) {
      currentStep.value++
      saveProgress()
    }
  }

  function previousStep() {
    if (currentStep.value > 0) {
      currentStep.value--
      saveProgress()
    }
  }

  function updateFormData(data: Partial<ProfileFormData>) {
    formData.value = { ...formData.value, ...data }
    saveProgress()
  }

  function saveProgress() {
    if (process.client) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          step: currentStep.value,
          data: formData.value,
        })
      )
    }
  }

  function loadProgress() {
    if (process.client) {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        try {
          const { step, data } = JSON.parse(saved)
          currentStep.value = step
          formData.value = { ...formData.value, ...data }
        } catch (error) {
          console.error('Failed to load onboarding progress:', error)
        }
      }
    }
  }

  function clearProgress() {
    if (process.client) {
      localStorage.removeItem(STORAGE_KEY)
    }
    currentStep.value = 0
    formData.value = {
      experienceLevel: 'beginner',
      preferredTrainingDays: ['Mon', 'Wed', 'Fri'],
      aggressiveness: 'moderate',
      units: 'metric',
      language: 'en',
    }
  }

  return {
    // State
    currentStep,
    formData,
    // Computed
    canProceedStep1,
    // Actions
    setStep,
    nextStep,
    previousStep,
    updateFormData,
    saveProgress,
    loadProgress,
    clearProgress,
  }
})
