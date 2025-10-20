<template>
  <Card
    class="checkbox-card"
    :class="{ selected: checked }"
    @click="handleClick"
    role="button"
    tabindex="0"
    @keydown.enter.prevent="handleClick"
    @keydown.space.prevent="handleClick"
  >
    <div class="checkbox-wrapper">
      <Checkbox v-model="checked" :inputId="inputId" :binary="true" @click.stop />
    </div>
    <div class="label-wrapper">
      <label :for="inputId" class="card-label" @click.stop="handleClick">
        {{ label }}
      </label>
      <div v-if="description" class="card-description">
        {{ description }}
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { uniqueId } from 'lodash-es'

interface Props {
  label: string
  description?: string
  inputId?: string
}

const { inputId = uniqueId(`checkbox-card`), description, label } = defineProps<Props>()

const checked = defineModel<boolean>({ required: true })

const handleClick = () => {
  checked.value = !checked.value
}
</script>

<style scoped>
.checkbox-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  border: 2px solid var(--p-surface-700);
  border-radius: var(--p-border-radius);
  background: var(--p-surface-900);
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 100px;
}

.checkbox-card:hover {
  border-color: var(--p-surface-600);
  background: var(--p-surface-800);
}

.checkbox-card:focus {
  outline: 2px solid var(--p-primary-color);
  outline-offset: 2px;
}

.checkbox-card.selected {
  border-color: var(--p-primary-color);
  background: var(--p-surface-800);
}

.checkbox-wrapper {
  display: flex;
  align-items: flex-start;
}

.label-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.card-label {
  font-size: 1rem;
  font-weight: 600;
  color: var(--p-text-color);
  cursor: pointer;
  user-select: none;
}

.card-description {
  font-size: 0.875rem;
  color: var(--p-text-muted-color);
  line-height: 1.4;
}

/* Ensure checkbox doesn't shrink */
.checkbox-wrapper :deep(.p-checkbox) {
  flex-shrink: 0;
}
</style>
