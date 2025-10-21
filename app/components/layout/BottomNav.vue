<template>
  <nav class="bottom-nav" role="navigation" aria-label="Main navigation">
    <Tabs :value="activeRoute">
      <TabList>
        <Tab
          v-for="item in navItems"
          :key="item.route"
          :value="item.route"
          as-child
        >
          <NuxtLink
            :to="item.route"
            class="nav-item"
            :aria-label="item.label"
          >
            <span class="nav-item__icon-wrapper">
              <i :class="item.icon" class="nav-item__icon" />
              <span v-if="item.badge" class="nav-item__badge" aria-label="Active session"></span>
            </span>
            <span class="nav-item__label">{{ item.label }}</span>
          </NuxtLink>
        </Tab>
      </TabList>
    </Tabs>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Tabs from 'primevue/tabs'
import TabList from 'primevue/tablist'
import Tab from 'primevue/tab'

interface NavItem {
  route: string
  label: string
  icon: string
  badge?: boolean
}

const route = useRoute()

// TODO: Replace with actual session store check
const hasActiveSession = computed(() => false)

const navItems = computed<NavItem[]>(() => [
  {
    route: '/',
    label: 'Home',
    icon: 'pi pi-home'
  },
  {
    route: '/session',
    label: 'Workout',
    icon: 'pi pi-bolt',
    badge: hasActiveSession.value
  },
  {
    route: '/progress',
    label: 'Progress',
    icon: 'pi pi-chart-line'
  },
  {
    route: '/profile',
    label: 'Profile',
    icon: 'pi pi-user'
  }
])

const activeRoute = computed(() => {
  // Match exact route for home, prefix match for others
  const currentPath = route.path
  if (currentPath === '/') return '/'
  
  const matchedItem = navItems.value.find(item => 
    item.route !== '/' && currentPath.startsWith(item.route)
  )
  
  return matchedItem?.route || currentPath
})
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: var(--bottom-nav-height, 4rem);
  background: var(--p-surface-0);
  border-top: 1px solid var(--p-surface-border);
  padding-bottom: env(safe-area-inset-bottom, 0);
  z-index: var(--z-bottom-nav, 1000);
  box-shadow: 0 -0.125rem 0.5rem rgba(0, 0, 0, 0.05);
}

/* Override PrimeVue Tabs default styles for bottom nav layout */
.bottom-nav :deep(.p-tablist) {
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 100%;
  border: none;
  background: transparent;
  padding: 0;
}

.bottom-nav :deep(.p-tab) {
  flex: 1;
  border: none;
  background: transparent;
  padding: 0;
  margin: 0;
}

.bottom-nav :deep(.p-tab[data-p-active="true"]) {
  background: transparent;
  border: none;
}

/* Custom nav item styling */
.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--nav-gap, 0.25rem);
  width: 100%;
  min-height: var(--bottom-nav-item-size, 3rem);
  padding: 0.5rem;
  border-radius: var(--p-border-radius, 0.5rem);
  color: var(--p-text-muted-color);
  text-decoration: none;
  transition: all 150ms ease;
  cursor: pointer;
  position: relative;
}

.nav-item:hover,
.nav-item:focus-visible {
  background: var(--p-surface-50);
  transform: scale(1.05);
  outline: none;
}

.nav-item:focus-visible {
  box-shadow: 0 0 0 2px var(--p-primary-color);
}

/* Active state via router-link-active class */
.nav-item.router-link-active {
  color: var(--p-primary-color);
  font-weight: 600;
}

.nav-item.router-link-active .nav-item__icon-wrapper {
  background: var(--p-primary-100);
  border-radius: 50%;
  padding: 0.375rem;
}

.nav-item__icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 150ms ease;
}

.nav-item__icon {
  font-size: var(--bottom-nav-icon-size, 1.5rem);
}

.nav-item__badge {
  position: absolute;
  top: -0.125rem;
  right: -0.125rem;
  width: 0.5rem;
  height: 0.5rem;
  background: var(--p-primary-color);
  border-radius: 50%;
  border: 2px solid var(--p-surface-0);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
}

.nav-item__label {
  font-size: var(--bottom-nav-font-size, 0.75rem);
  line-height: 1;
  text-align: center;
  white-space: nowrap;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .nav-item,
  .nav-item__icon-wrapper {
    transition: none;
  }
  
  .nav-item:hover,
  .nav-item:focus-visible {
    transform: none;
  }
  
  .nav-item__badge {
    animation: none;
  }
}

/* Tablet and desktop adjustments */
@media (min-width: 768px) {
  .bottom-nav {
    max-width: 28rem;
    left: 50%;
    transform: translateX(-50%);
    border-radius: var(--p-border-radius, 0.5rem) var(--p-border-radius, 0.5rem) 0 0;
    border-left: 1px solid var(--p-surface-border);
    border-right: 1px solid var(--p-surface-border);
  }
}
</style>
