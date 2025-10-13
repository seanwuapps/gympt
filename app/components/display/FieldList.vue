<template>
  <ul class="field-list">
    <li v-for="(field, index) in fields" :key="field.label" class="field-list-item">
      <FieldRow :label="field.label" :value="field.value" :default-value="field.defaultValue">
        <template v-if="field.slot" #default>
          <slot :name="field.slot" :value="field.value" />
        </template>
      </FieldRow>
      <Divider v-if="index < fields.length - 1" />
    </li>
  </ul>
</template>

<script setup lang="ts">
export interface FieldDefinition {
  label: string
  value?: string | number | null
  defaultValue?: string
  slot?: string // Optional slot name for custom rendering
}

defineProps<{
  fields: FieldDefinition[]
}>()
</script>

<style scoped>
.field-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.field-list-item {
  list-style: none;
}
</style>
