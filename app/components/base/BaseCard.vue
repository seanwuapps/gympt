<template>
  <article class="base-card">
    <header v-if="$slots.header" class="card-header">
      <slot name="header" />
    </header>

    <div class="card-content">
      <slot name="content">
        <slot />
      </slot>
    </div>

    <footer v-if="$slots.footer" class="card-footer">
      <slot name="footer" />
    </footer>
  </article>
</template>

<script setup lang="ts">
// No props needed for basic card
</script>

<style scoped>
.base-card {
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
}

.card-header {
  padding: 1rem;
  border-bottom: 1px solid #eee;
  font-weight: 600;
}

.card-content {
  padding: 1rem;
}

.card-footer {
  padding: 1rem;
  border-top: 1px solid #eee;
}
</style>




