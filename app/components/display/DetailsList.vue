<template>
  <ul class="details-list">
    <li v-for="detail in details" :key="detail.label" class="details-list-item">
      <FieldRow :label="detail.label" :value="detail.value" :default-value="detail.defaultValue">
        <template v-if="detail.slot" #default>
          <slot :name="detail.slot" :value="detail.value" />
        </template>
      </FieldRow>
    </li>
  </ul>
</template>

<script setup lang="ts">
export interface DetailItem {
  label: string
  value?: string | number | null
  defaultValue?: string
  slot?: string // Optional slot name for custom rendering
}

defineProps<{
  details: DetailItem[]
}>()
</script>

<style scoped>
.details-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.details-list-item {
  list-style: none;
}
</style>




