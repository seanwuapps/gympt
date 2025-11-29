<template>
  <div class="page-messages">
    <transition-group name="message">
      <div
        v-for="message in messages"
        :key="message.id"
        :class="['page-message', `message-${message.severity}`]"
        role="alert"
      >
        <span class="message-icon">{{ severityIcon(message.severity) }}</span>
        <div class="message-content">
          <strong class="message-summary">{{ message.summary }}</strong>
          <p v-if="message.detail" class="message-detail">{{ message.detail }}</p>
        </div>
        <BaseButton
          @click="message.id && remove(message.id)"
          class="message-close"
          aria-label="Close"
        >
          ✕
        </BaseButton>
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
const toast = useToast()
const messages = toast.messages
const { remove } = toast

function severityIcon(severity: string): string {
  const icons: Record<string, string> = {
    success: '✅',
    info: 'ℹ️',
    warn: '⚠️',
    error: '❌',
  }
  return icons[severity] || 'ℹ️'
}
</script>

<style scoped>
.page-messages {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.page-message {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 4px;
  border: 1px solid;
}

.message-success {
  background-color: #d4edda;
  border-color: #c3e6cb;
  color: #155724;
}

.message-info {
  background-color: #d1ecf1;
  border-color: #bee5eb;
  color: #0c5460;
}

.message-warn {
  background-color: #fff3cd;
  border-color: #ffeaa7;
  color: #856404;
}

.message-error {
  background-color: #f8d7da;
  border-color: #f5c6cb;
  color: #721c24;
}

.message-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.message-content {
  flex: 1;
}

.message-summary {
  display: block;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.message-detail {
  margin: 0;
  font-size: 0.875rem;
}

.message-close {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  opacity: 0.6;
  flex-shrink: 0;
}

.message-close:hover {
  opacity: 1;
}

/* Transition animations */
.message-enter-active,
.message-leave-active {
  transition: all 0.3s ease;
}

.message-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.message-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
