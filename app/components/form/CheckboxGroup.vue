<template>
  <div class="checkbox-group">
    <div
      v-for="option in options"
      :key="option.value"
      class="checkbox-item"
      :class="{ 'checkbox-item--selected': isSelected(option.value) }"
      @click="toggleOption(option.value)"
      @keydown.space.prevent="toggleOption(option.value)"
      @keydown.enter.prevent="toggleOption(option.value)"
      tabindex="0"
      role="checkbox"
      :aria-checked="isSelected(option.value)"
    >
      <i v-if="isSelected(option.value)" class="pi pi-check checkbox-check" />
      <span v-if="option.icon" class="checkbox-icon">{{ option.icon }}</span>
      <span class="checkbox-label">{{ option.label }}</span>
      <!-- Hidden input for accessibility/form compatibility -->
      <input
        type="checkbox"
        :value="option.value"
        :checked="isSelected(option.value)"
        class="hidden-input"
        tabindex="-1"
        aria-hidden="true"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
interface CheckboxOption {
  value: string
  label: string
  icon?: string
}

interface Props {
  modelValue?: string[]
  options: CheckboxOption[]
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
})

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

const isSelected = (value: string) => {
  return props.modelValue?.includes(value) ?? false
}

const toggleOption = (value: string) => {
  const currentValue = props.modelValue ?? []
  const newValue = isSelected(value)
    ? currentValue.filter((v) => v !== value)
    : [...currentValue, value]
  emit('update:modelValue', newValue)
}
</script>

<style scoped>
.checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
}

.checkbox-item {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: 2px solid var(--p-surface-border);
  border-radius: 2rem;
  background: var(--p-surface-0);
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
  position: relative;
}

.checkbox-item:hover {
  border-color: var(--p-primary-color);
  background: var(--p-surface-50);
  transform: translateY(-2px);
  color: var(--p-surface-900);
}

.checkbox-item:focus-visible {
  outline: 2px solid var(--p-primary-color);
  outline-offset: 2px;
}

.checkbox-item:active {
  transform: scale(0.98);
}

.checkbox-item--selected {
  border-color: var(--p-primary-color);
  background: var(--p-primary-color);
  color: var(--p-primary-contrast-color);
}

.checkbox-item--selected:hover {
  transform: translateY(-2px);
}

.checkbox-check {
  font-size: 0.875rem;
  font-weight: bold;
}

.checkbox-icon {
  font-size: 1.25rem;
  line-height: 1;
}

.checkbox-label {
  font-weight: 500;
  font-size: 0.9375rem;
  white-space: nowrap;
}

.hidden-input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .checkbox-group {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }

  .checkbox-item {
    width: 100%;
    justify-content: center;
    padding: 0.75rem 1rem;
  }

  .checkbox-label {
    font-size: 0.9375rem;
  }
}
</style>
