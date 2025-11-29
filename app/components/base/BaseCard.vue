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
  border: 1px solid;
  border-radius: 0.5rem;
}

.card-header,
.card-footer {
  padding: 1rem;
}

.card-header {
  border-bottom: 1px solid;
  font-weight: 600;
}

.card-content {
  padding: 1rem;
}

.card-footer {
  border-top: 1px solid;
}
</style>
