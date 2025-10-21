<template>
  <span class="checkbox-card">
    <span class="checkbox-mark">
      <input type="checkbox" v-model="checked" :inputId="inputId" :binary="true" @click.stop />
    </span>
    <span class="checkbox-label">
      <label :for="inputId" class="card-label" @click.stop="handleClick">
        {{ label }}
      </label>
      <span v-if="description" class="card-description">
        {{ description }}
      </span>
    </span>
  </span>
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
  display: inline-block;
  position: relative;
  width: 100%;
  height: 100%;
  box-shadow: 0 0 0 1px #000;
  padding: 1rem;
  border: 1px solid red;
}

.checkbox-mark {
  position: absolute;
  top: 0;
  left: 0;
}

.checkbox-label {
  display: flex;
  flex-direction: column;
}
</style>
