<template>
  <div
    class="checkbox-card"
    :class="{ 'checkbox-card--checked': checked, 'checkbox-card--disabled': disabled }"
    @click="toggle"
    @keydown.space.prevent="toggle"
    @keydown.enter.prevent="toggle"
    tabindex="0"
    role="checkbox"
    :aria-checked="checked"
    :aria-disabled="disabled"
  >
    <div class="checkbox-indicator">
      <i v-if="checked" class="pi pi-check" />
    </div>
    <div class="checkbox-content">
      <span class="checkbox-label">{{ label }}</span>
      <span v-if="description" class="checkbox-description">{{ description }}</span>
    </div>
    <!-- Hidden input for form submission compatibility if needed -->
    <input type="checkbox" v-model="checked" :value="value" class="hidden-input" tabindex="-1" />
  </div>
</template>

<script setup lang="ts">
interface Props {
  label: string
  description?: string
  value?: any
  disabled?: boolean
}

const props = defineProps<Props>()
const checked = defineModel<boolean>({ required: true })

const toggle = () => {
  if (props.disabled) return
  checked.value = !checked.value
}
</script>

<style scoped>
.checkbox-card {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  border: 1px solid var(--p-surface-700);
  background: var(--p-surface-900);
  border-radius: var(--p-border-radius);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  user-select: none;
}

.checkbox-card:hover:not(.checkbox-card--disabled) {
  border-color: var(--p-surface-500);
  background: var(--p-surface-800);
}

.checkbox-card:active:not(.checkbox-card--disabled) {
  transform: scale(0.98);
}

.checkbox-card:focus-visible {
  outline: 2px solid var(--p-primary-color);
  outline-offset: 2px;
}

/* Checked State */
.checkbox-card--checked {
  border-color: var(--p-primary-color);
  background: rgba(212, 255, 0, 0.05); /* Subtle lime tint */
}

.checkbox-card--checked:hover:not(.checkbox-card--disabled) {
  background: rgba(212, 255, 0, 0.1);
}

/* Indicator (Custom Checkbox) */
.checkbox-indicator {
  flex-shrink: 0;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 4px;
  border: 2px solid var(--p-surface-600);
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  margin-top: 0.125rem; /* Align with first line of text */
}

.checkbox-card:hover .checkbox-indicator {
  border-color: var(--p-surface-400);
}

.checkbox-card--checked .checkbox-indicator {
  background: var(--p-primary-color);
  border-color: var(--p-primary-color);
  color: var(--p-surface-900); /* Dark checkmark on lime bg */
}

.checkbox-indicator i {
  font-size: 0.75rem;
  font-weight: bold;
}

/* Content */
.checkbox-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.checkbox-label {
  font-weight: 600;
  color: var(--p-text-color);
  line-height: 1.5;
}

.checkbox-description {
  font-size: 0.875rem;
  color: var(--p-text-muted-color);
  line-height: 1.4;
}

/* Disabled State */
.checkbox-card--disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.hidden-input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}
</style>




