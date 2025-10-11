<template>
  <div class="onboarding-step">
    <h2 class="step-title">Let's get started!</h2>

    <el-form :model="formData" label-position="top">
      <el-form-item label="Experience Level" required>
        <el-radio-group v-model="formData.experienceLevel" class="experience-selector">
          <el-radio value="beginner" border>
            <div class="radio-content">
              <span class="label">Beginner</span>
              <span class="desc">New to training</span>
            </div>
          </el-radio>
          <el-radio value="intermediate" border>
            <div class="radio-content">
              <span class="label">Intermediate</span>
              <span class="desc">6+ months experience</span>
            </div>
          </el-radio>
          <el-radio value="advanced" border>
            <div class="radio-content">
              <span class="label">Advanced</span>
              <span class="desc">2+ years experience</span>
            </div>
          </el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="Preferred Training Days" required>
        <el-checkbox-group v-model="formData.preferredTrainingDays" class="day-selector">
          <el-checkbox-button
            v-for="day in ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']"
            :key="day"
            :value="day"
            class="day-button"
          >
            {{ day.charAt(0) }}
          </el-checkbox-button>
        </el-checkbox-group>
        <div v-if="formData.preferredTrainingDays.length === 0" class="error-text">
          Please select at least one training day
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import type { ProfileFormData } from '~/composables/useProfile'

const props = defineProps<{
  modelValue: Partial<ProfileFormData>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Partial<ProfileFormData>]
}>()

const formData = computed({
  get: () => ({
    experienceLevel: props.modelValue.experienceLevel || 'beginner',
    preferredTrainingDays: props.modelValue.preferredTrainingDays || ['Mon', 'Wed', 'Fri'],
  }),
  set: (value) => {
    emit('update:modelValue', { ...props.modelValue, ...value })
  },
})

watch(
  formData,
  (newValue) => {
    emit('update:modelValue', { ...props.modelValue, ...newValue })
  },
  { deep: true }
)

defineExpose({
  validate: () => {
    return (
      formData.value.experienceLevel !== undefined &&
      formData.value.preferredTrainingDays.length > 0
    )
  },
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

.experience-selector {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
}

.experience-selector :deep(.el-radio) {
  margin-right: 0;
  width: 100%;
}

.radio-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0.5rem 0;
}

.radio-content .label {
  font-weight: 600;
  font-size: 1rem;
}

.radio-content .desc {
  font-size: 0.875rem;
  color: var(--el-text-color-secondary);
  margin-top: 0.25rem;
}

.day-selector {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

.day-button {
  min-width: 2.75rem;
  min-height: 2.75rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-text {
  color: var(--el-color-danger);
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

@media (max-width: 768px) {
  .step-title {
    font-size: 1.5rem;
  }
}
</style>
