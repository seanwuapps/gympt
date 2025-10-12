<template>
  <div class="checkbox-button-group">
    <div
      v-for="option in options"
      :key="option.value"
      class="checkbox-button"
      :class="{ selected: isSelected(option.value) }"
      @click="toggleOption(option.value)"
    >
      <Checkbox
        :modelValue="modelValue"
        :inputId="option.value"
        :value="option.value"
        @update:modelValue="handleUpdate"
      />
      <label :for="option.value" class="checkbox-label">
        {{ option.label }}
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
interface CheckboxOption {
  value: string
  label: string
}

interface Props {
  modelValue: string[]
  options: CheckboxOption[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

const isSelected = (value: string) => {
  return props.modelValue.includes(value)
}

const toggleOption = (value: string) => {
  const newValue = isSelected(value)
    ? props.modelValue.filter((v) => v !== value)
    : [...props.modelValue, value]
  emit('update:modelValue', newValue)
}

const handleUpdate = (value: string[]) => {
  emit('update:modelValue', value)
}
</script>

<style scoped>
.checkbox-button-group {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

.checkbox-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border: 2px solid var(--p-surface-border);
  border-radius: 50%;
  min-width: 3rem;
  min-height: 3rem;
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--p-surface-0);
  position: relative;
}

.checkbox-button:hover {
  border-color: var(--p-primary-color);
  background: var(--p-surface-50);
  transform: scale(1.05);
}

.checkbox-button.selected {
  border-color: var(--p-primary-color);
  background: var(--p-primary-color);
  color: var(--p-primary-contrast-color);
}

.checkbox-button :deep(.p-checkbox) {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.checkbox-label {
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  color: var(--p-text-color);
  user-select: none;
}

.checkbox-button.selected .checkbox-label {
  color: var(--p-primary-contrast-color);
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .checkbox-button-group {
    gap: 0.375rem;
  }

  .checkbox-button {
    min-width: 2.75rem;
    min-height: 2.75rem;
    padding: 0.625rem;
  }

  .checkbox-label {
    font-size: 0.9375rem;
  }
}

/* Touch-friendly tap targets */
@media (hover: none) and (pointer: coarse) {
  .checkbox-button {
    min-width: 3.25rem;
    min-height: 3.25rem;
    padding: 0.875rem;
  }

  .checkbox-button:active {
    transform: scale(0.95);
  }
}

/* Ensure proper spacing on small screens */
@media (max-width: 480px) {
  .checkbox-button-group {
    justify-content: flex-start;
  }
}
</style>
