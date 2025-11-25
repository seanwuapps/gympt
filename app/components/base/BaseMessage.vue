<template>
  <div v-if="!closed" role="alert" :class="['base-message', `severity-${severity}`]">
    <span class="message-icon">{{ severityIcon }}</span>
    <span class="message-text">
      <slot />
    </span>
    <BaseButton
      v-if="closable"
      @click="closed = true"
      class="close-button"
      aria-label="Close message"
    >
      ✕
    </BaseButton>
  </div>
</template>

<script setup lang="ts">
interface Props {
  severity?: 'info' | 'success' | 'warn' | 'error'
  closable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  severity: 'info',
  closable: true,
})

const closed = ref(false)

const severityIcon = computed(() => {
  const icons = {
    info: 'ℹ️',
    success: '✅',
    warn: '⚠️',
    error: '❌',
  }
  return icons[props.severity] || icons.info
})
</script>

<style scoped>
.base-message {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border: 1px solid;
  border-radius: 4px;
  margin: 0.5rem 0;
}

.base-message.severity-info {
  background-color: #e7f3ff;
  border-color: #b3d9ff;
  color: #004085;
}

.base-message.severity-success {
  background-color: #d4edda;
  border-color: #c3e6cb;
  color: #155724;
}

.base-message.severity-warn {
  background-color: #fff3cd;
  border-color: #ffeaa7;
  color: #856404;
}

.base-message.severity-error {
  background-color: #f8d7da;
  border-color: #f5c6cb;
  color: #721c24;
}

.message-icon {
  flex-shrink: 0;
  font-size: 1.25rem;
}

.message-text {
  flex: 1;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.25rem;
  line-height: 1;
  opacity: 0.6;
}

.close-button:hover {
  opacity: 1;
}
</style>
