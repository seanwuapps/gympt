<template>
  <component
    :is="asChild ? 'div' : 'button'"
    :class="['base-tab', { active: isActive }]"
    role="tab"
    :aria-selected="isActive"
    v-bind="$attrs"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
import { inject, computed } from 'vue'

interface Props {
  value: string
  asChild?: boolean
}

const props = defineProps<Props>()

// Get active value from parent Tabs component
const activeValue = inject<ComputedRef<string | undefined>>(
  'tabsActiveValue',
  computed(() => undefined)
)

const isActive = computed(() => {
  return props.value === activeValue.value
})
</script>

<style scoped>
.base-tab {
  padding: 0.5rem 1rem;
  border: none;
  background: transparent;
  cursor: pointer;
  font-family: inherit;
  font-size: inherit;
}

.base-tab.active {
  font-weight: bold;
  border-bottom: 2px solid currentColor;
}
</style>




