<template>
  <div class="chip-group">
    <div
      v-for="option in options"
      :key="option.value"
      class="chip"
      :class="{ selected: isSelected(option.value) }"
      @click="toggleOption(option.value)"
      role="checkbox"
      :aria-checked="isSelected(option.value)"
      tabindex="0"
      @keydown.enter.space.prevent="toggleOption(option.value)"
    >
      <span v-if="option.icon" class="chip-icon">{{ option.icon }}</span>
      <span class="chip-label">{{ option.label }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface ChipOption {
  value: string
  label: string
  icon?: string
}

interface Props {
  modelValue?: string[]
  options: ChipOption[]
}

const props = defineProps<Props>()
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
.chip-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
}

.chip {
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
}

.chip:hover {
  border-color: var(--p-primary-color);
  background: var(--p-surface-50);
  transform: translateY(-2px);
}

.chip:focus {
  outline: 2px solid var(--p-primary-color);
  outline-offset: 2px;
}

.chip.selected {
  border-color: var(--p-primary-color);
  background: var(--p-primary-color);
  color: var(--p-primary-contrast-color);
}

.chip-icon {
  font-size: 1.25rem;
  line-height: 1;
}

.chip-label {
  font-weight: 500;
  font-size: 0.9375rem;
  white-space: nowrap;
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .chip-group {
    gap: 0.5rem;
  }

  .chip {
    padding: 0.625rem 0.875rem;
  }

  .chip-label {
    font-size: 0.875rem;
  }
}

/* Touch-friendly tap targets */
@media (hover: none) and (pointer: coarse) {
  .chip {
    min-height: 44px;
    padding: 0.75rem 1rem;
  }

  .chip:active {
    transform: scale(0.95);
  }
}

/* Small screens - 2 column layout */
@media (max-width: 480px) {
  .chip-group {
    justify-content: flex-start;
  }

  .chip {
    flex: 0 0 calc(50% - 0.25rem);
    justify-content: center;
  }
}
</style>




