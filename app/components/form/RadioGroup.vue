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




