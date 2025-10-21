<template>
  <div class="app-layout">
    <main class="app-main">
      <slot />
    </main>
    <BottomNav v-if="showBottomNav" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// Hide bottom nav on auth pages
const showBottomNav = computed(() => {
  const hideOnRoutes = ['/login', '/onboarding', '/confirm']
  return !hideOnRoutes.includes(route.path)
})
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-main {
  flex: 1;
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
}

/* Tablet and desktop: constrain content width */
@media (min-width: 768px) {
  .app-main {
    max-width: 48rem;
    padding: 0 var(--spacing-md);
  }
}
</style>
