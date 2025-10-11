<template>
  <div class="onboarding-step">
    <h2 class="step-title">Personalize your training</h2>

    <el-form label-position="top">
      <el-form-item label="Training Goals (Optional)">
        <el-input
          v-model="goals"
          type="textarea"
          :rows="3"
          :maxlength="500"
          show-word-limit
          placeholder="e.g., Build strength for hiking, lose 10kg, prepare for marathon..."
        />
      </el-form-item>

      <el-form-item label="Progression Pace">
        <el-select v-model="aggressiveness" placeholder="Select progression pace">
          <el-option value="conservative">
            <div class="option-content">
              <span class="option-label">Conservative</span>
              <span class="option-desc">Slower, safer progression</span>
            </div>
          </el-option>
          <el-option value="moderate">
            <div class="option-content">
              <span class="option-label">Moderate</span>
              <span class="option-desc">Balanced approach (recommended)</span>
            </div>
          </el-option>
          <el-option value="aggressive">
            <div class="option-content">
              <span class="option-label">Aggressive</span>
              <span class="option-desc">Faster progression, more challenge</span>
            </div>
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
const onboardingStore = useOnboardingStore()

const goals = computed({
  get: () => onboardingStore.formData.goals || '',
  set: (value) => onboardingStore.updateFormData({ goals: value }),
})

const aggressiveness = computed({
  get: () => onboardingStore.formData.aggressiveness || 'moderate',
  set: (value) => onboardingStore.updateFormData({ aggressiveness: value }),
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

.option-content {
  display: flex;
  flex-direction: column;
}

.option-label {
  font-weight: 600;
}

.option-desc {
  font-size: 0.875rem;
  color: var(--el-text-color-secondary);
  margin-top: 0.25rem;
}

@media (max-width: 768px) {
  .step-title {
    font-size: 1.5rem;
  }
}
</style>
