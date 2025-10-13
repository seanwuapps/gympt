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
}

.field-value {
  flex: 1;
  text-align: right;
  color: var(--p-text-color);
}
</style>
