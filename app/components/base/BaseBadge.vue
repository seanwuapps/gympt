<template>
  <span :class="['base-badge', `severity-${severity}`]">
    {{ value }}
  </span>
</template>

<script setup lang="ts">
interface Props {
  value: string
  severity?: 'primary' | 'secondary' | 'success' | 'danger' | 'warn' | 'info'
}

withDefaults(defineProps<Props>(), {
  severity: 'primary',
})
</script>

<style scoped>
.base-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 4px;
  text-align: center;
}

.base-badge.severity-primary {
  background-color: #007bff;
  color: white;
}

.base-badge.severity-secondary {
  background-color: #6c757d;
  color: white;
}

.base-badge.severity-success {
  background-color: #28a745;
  color: white;
}

.base-badge.severity-danger {
  background-color: #dc3545;
  color: white;
}

.base-badge.severity-warn {
  background-color: #ffc107;
  color: #212529;
}

.base-badge.severity-info {
  background-color: #17a2b8;
  color: white;
}
</style>




