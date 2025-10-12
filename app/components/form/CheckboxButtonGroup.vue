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
