<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="buttonClasses"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="loading-indicator">⏳</span>
    <span v-else-if="icon" class="icon">{{ icon }}</span>
    <span v-if="label" class="label">{{ label }}</span>
    <slot />
  </button>
</template>

<script setup lang="ts">
interface Props {
  label?: string
  icon?: string // emoji character
  loading?: boolean
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  text?: boolean
  outlined?: boolean
  severity?: 'primary' | 'secondary' | 'success' | 'danger' | 'warn' | 'info'
  size?: 'small' | 'medium' | 'large'
  rounded?: boolean
  badge?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'button',
  text: false,
  outlined: false,
  severity: 'primary',
  size: 'medium',
  rounded: false,
})

defineEmits(['click'])

const buttonClasses = computed(() => {
  const classes = ['base-button']

  if (props.text) classes.push('text')
  if (props.outlined) classes.push('outlined')
  if (props.severity) classes.push(`severity-${props.severity}`)
  if (props.size) classes.push(`size-${props.size}`)
  if (props.rounded) classes.push('rounded')
  if (props.loading) classes.push('loading')

  return classes.join(' ')
})
</script>

<style scoped>
/* Minimal styling - relies mostly on browser defaults */
.base-button {
  /* Use browser default button styles */
  cursor: pointer;
  font-family: inherit;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
}

.base-button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.base-button.size-small {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.base-button.size-large {
  padding: 0.75rem 1.5rem;
  font-size: 1.125rem;
}

.base-button.rounded {
  border-radius: 50%;
  padding: 0.5rem;
}

.base-button.text {
  background: none;
  border: none;
  text-decoration: underline;
}

.base-button.outlined {
  background: transparent;
}

.loading-indicator {
  display: inline-block;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
