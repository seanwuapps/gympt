<template>
  <div class="field-row">
    <label class="field-label">{{ label }}</label>
    <div class="field-value">
      <slot>{{ value || defaultValue }}</slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  value?: string | number | null
  defaultValue?: string
}>()
</script>

<style scoped>
.field-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1rem 0;
}

.field-label {
  font-weight: 600;
  color: rgba(255, 255, 255, 0.87);
  min-width: 200px;
}

.field-value {
  flex: 1;
  text-align: right;
  color: rgba(255, 255, 255, 0.6);
}

@media (max-width: 768px) {
  .field-row {
    flex-direction: column;
    gap: 0.5rem;
  }

  .field-label {
    min-width: auto;
  }

  .field-value {
    text-align: left;
  }
}
</style>
