<template>
  <div class="form-section">
    <h3 v-if="showTitle" class="section-title">
      <i class="pi pi-target" />
      Goals
    </h3>
    <div class="field">
      <CheckboxGroup
        :modelValue="modelValue"
        @update:modelValue="emit('update:modelValue', $event)"
        :options="goalOptions"
      />
      <small class="help-text">Select all that apply</small>
    </div>
  </div>
</template>

<script setup lang="ts">
import CheckboxGroup from '~/components/form/CheckboxGroup.vue'

withDefaults(
  defineProps<{
    modelValue?: string[]
    showTitle?: boolean
  }>(),
  {
    modelValue: () => [],
    showTitle: true,
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

const goalOptions = [
  { value: 'strength', label: 'Build Strength', icon: '💪' },
  { value: 'muscle', label: 'Gain Muscle', icon: '🏋️' },
  { value: 'weight_loss', label: 'Lose Weight', icon: '⚖️' },
  { value: 'endurance', label: 'Improve Endurance', icon: '🏃' },
  { value: 'flexibility', label: 'Increase Flexibility', icon: '🧘' },
  { value: 'athletic', label: 'Athletic Performance', icon: '⚡' },
  { value: 'health', label: 'General Health', icon: '❤️' },
  { value: 'rehab', label: 'Rehabilitation', icon: '🩹' },
]
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

.help-text {
  font-size: 0.75rem;
  color: var(--p-text-muted-color);
}
</style>




