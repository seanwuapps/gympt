<template>
  <select :value="modelValue" @change="handleChange" class="base-select">
    <option v-if="placeholder" value="" disabled selected>{{ placeholder }}</option>
    <option v-for="(option, index) in options" :key="index" :value="option">
      <slot name="option" :option="option">
        {{ getOptionLabel(option) }}
      </slot>
    </option>
  </select>
</template>

<script setup lang="ts">
interface Props {
  modelValue?: any
  options: any[]
  placeholder?: string
  optionLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  optionLabel: 'label',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void
}>()

function handleChange(event: Event) {
  const target = event.target as HTMLSelectElement
  const selectedIndex = target.selectedIndex

  // Adjust for placeholder option if present
  const optionIndex = props.placeholder ? selectedIndex - 1 : selectedIndex

  if (optionIndex >= 0 && optionIndex < props.options.length) {
    emit('update:modelValue', props.options[optionIndex])
  }
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




