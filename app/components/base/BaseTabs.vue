<template>
  <div class="base-tabs">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { provide } from 'vue'

interface Props {
  value?: string
}

const props = defineProps<Props>()

// Provide the active value to child components
provide(
  'tabsActiveValue',
  computed(() => props.value)
)
</script>
