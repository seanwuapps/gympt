<template>
  <div class="radio-group">
    <div
      v-for="option in options"
      :key="option.value"
      class="radio-option"
      :class="{ selected: modelValue === option.value }"
      @click="handleSelect(option.value)"
    >
      <RadioButton
        :modelValue="modelValue"
        :inputId="option.value"
        :value="option.value"
        @update:modelValue="handleSelect"
      />
      <label :for="option.value" class="radio-content">
        <span class="radio-label">{{ option.label }}</span>
        <span v-if="option.description" class="radio-description">{{ option.description }}</span>
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
interface RadioOption {
  value: string
  label: string
  description?: string
}

interface Props {
  modelValue: string
  options: RadioOption[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const handleSelect = (value: string) => {
  emit('update:modelValue', value)
}
</script>

<style scoped>
.radio-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.radio-option {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  border: 2px solid var(--p-surface-border);
  border-radius: var(--p-border-radius);
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--p-surface-0);
}

.radio-option:hover {
  border-color: var(--p-primary-color);
  background: var(--p-surface-50);
}

.radio-option.selected {
  border-color: var(--p-primary-color);
  background: var(--p-primary-50);
}

.radio-option :deep(.p-radiobutton) {
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.radio-option :deep(.p-radiobutton .p-radiobutton-box) {
  background: var(--p-surface-0);
  border-color: var(--p-surface-border);
}

.radio-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  cursor: pointer;
  gap: 0.25rem;
}

.radio-label {
  font-weight: 600;
  font-size: 1rem;
  color: var(--p-text-color);
}

.radio-description {
  font-size: 0.875rem;
  color: var(--p-text-muted-color);
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .radio-option {
    padding: 0.875rem;
  }

  .radio-label {
    font-size: 0.9375rem;
  }

  .radio-description {
    font-size: 0.8125rem;
  }
}

/* Touch-friendly tap targets */
@media (hover: none) and (pointer: coarse) {
  .radio-option {
    min-height: 3rem;
    padding: 1rem;
  }
}
</style>
