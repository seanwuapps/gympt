<template>
  <div class="form-section">
    <h3 v-if="showTitle" class="section-title">
      <i class="pi pi-heart" />
      Health & Safety
    </h3>
    <div class="field">
      <label class="field-label">
        Injury Flags / Limitations
        <span v-if="isRehabGoalSelected" class="required-indicator">*</span>
      </label>
      <Textarea
        :modelValue="modelValue"
        @update:modelValue="emit('update:modelValue', $event)"
        :rows="3"
        :maxlength="300"
        class="w-full"
        :class="{ 'p-invalid': isRehabGoalSelected && !modelValue }"
        placeholder="Describe any injuries or exercises to avoid..."
      />
      <small v-if="isRehabGoalSelected" class="help-text emphasis">
        <i class="pi pi-info-circle" />
        Required when Rehabilitation is selected as a goal. Please describe your injury or
        limitation.
      </small>
      <small class="char-count">{{ (modelValue || '').length }}/300</small>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue?: string
    goals?: string[]
    showTitle?: boolean
  }>(),
  {
    modelValue: '',
    goals: () => [],
    showTitle: true,
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

// Check if rehab goal is selected
const isRehabGoalSelected = computed(() => {
  return props.goals?.includes('rehab') ?? false
})
</script>

<style scoped>
.form-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--p-text-color);
  margin: 0;
}

.section-title i {
  color: var(--p-primary-color);
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field-label {
  font-weight: 500;
  color: var(--p-text-color);
  font-size: 0.875rem;
}

.required-indicator {
  color: var(--p-red-500);
  margin-left: 0.25rem;
}

.help-text,
.char-count {
  font-size: 0.75rem;
  color: var(--p-text-muted-color);
}

.help-text.emphasis {
  color: var(--p-primary-color);
  display: flex;
  align-items: center;
  gap: 0.375rem;
  margin-top: 0.25rem;
}

.char-count {
  text-align: right;
}

.w-full {
  width: 100%;
}
</style>




