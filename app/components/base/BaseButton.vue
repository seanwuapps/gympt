<template>
  <component
    :is="to ? 'NuxtLink' : 'button'"
    :to="to"
    :type="to ? undefined : type"
    :disabled="disabled || loading"
    :class="buttonClasses"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="loading-indicator">⏳</span>
    <span v-else-if="icon" class="icon">{{ icon }}</span>
    <span v-if="label" class="label">{{ label }}</span>
    <slot />
  </component>
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
  to?: string | object
}

const props = withDefaults(defineProps<Props>(), {
  type: 'button',
  text: false,
  outlined: false,
  severity: 'primary',
  size: 'medium',
  rounded: false,
  to: undefined,
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
.base-button {
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  border: none;
  font-family: inherit;
}

.base-button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.base-button.severity-primary {
  background-color: var(--primary-color);
  color: white;
}

.loading-indicator {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
