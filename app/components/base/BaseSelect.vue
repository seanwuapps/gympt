<template>
  <select v-model="internalValue" class="base-select">
    <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
    <option v-for="(option, index) in options" :key="index" :value="getOptionValue(option)">
      <slot name="option" :option="option">
        {{ getOptionLabel(option) }}
      </slot>
    </option>
  </select>
</template>

<script setup lang="ts">
interface Props {
  options: any[]
  placeholder?: string
  optionLabel?: string
  optionValue?: string
}

const modelValue = defineModel<any>()

const props = withDefaults(defineProps<Props>(), {
  optionLabel: 'label',
  optionValue: 'value',
})

// Internal value synced with modelValue
const internalValue = computed({
  get() {
    return modelValue.value
  },
  set(val) {
    modelValue.value = val
  },
})

function getOptionValue(option: any): any {
  if (typeof option === 'string' || typeof option === 'number') return option
  if (typeof option === 'object' && option !== null) {
    return option[props.optionValue] ?? option
  }
  return option
}

function getOptionLabel(option: any): string {
  if (typeof option === 'string') return option
  if (typeof option === 'object' && option !== null) {
    // Try to build label from modality and focus if present
    if (option.modality) {
      return option.focus ? `${option.modality} - ${option.focus}` : option.modality
    }
    return option[props.optionLabel] || String(option)
  }
  return String(option)
}
</script>

<style scoped>
.base-select {
  /* Rely on browser default select styling */
  font-family: inherit;
  font-size: inherit;
  padding: 0.5rem;
  width: 100%;
}
</style>
