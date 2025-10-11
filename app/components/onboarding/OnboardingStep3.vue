<template>
  <div class="onboarding-step">
    <h2 class="step-title">Any injuries or limitations?</h2>

    <el-form label-position="top">
      <el-form-item label="Injury Flags (Optional)">
        <el-input
          v-model="injuryFlags"
          type="textarea"
          :rows="3"
          :maxlength="300"
          show-word-limit
          placeholder="e.g., Lower back pain, right knee issues, shoulder mobility..."
        >
          <template #prepend>
            <el-icon><WarningFilled /></el-icon>
          </template>
        </el-input>
        <div class="help-text">
          <el-text size="small" type="info">
            This helps the AI avoid exercises that may aggravate your condition
          </el-text>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { WarningFilled } from '@element-plus/icons-vue'

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

.help-text {
  margin-top: 0.5rem;
}

@media (max-width: 768px) {
  .step-title {
    font-size: 1.5rem;
  }
}
</style>
