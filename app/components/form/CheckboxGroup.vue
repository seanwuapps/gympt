<template>
  <div class="checkbox-group">
    <label v-for="option in options" :key="option.value" class="checkbox-item">
      <input type="checkbox" :value="option.value" :checked="isSelected(option.value)" />
      <span v-if="option.icon" class="checkbox-icon">{{ option.icon }}</span>
      <span class="checkbox-label">{{ option.label }}</span>
    </label>
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
input[type='checkbox'] {
  width: 1rem;
  height: 1rem;
}
.checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
}
</style>
