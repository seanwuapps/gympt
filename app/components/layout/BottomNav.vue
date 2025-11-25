<template>
  <nav class="bottom-nav" role="navigation" aria-label="Main navigation">
    <BaseTabs :value="activeRoute">
      <BaseTabList>
        <BaseTab
          v-for="item in navItems"
          :key="item.route + item.action"
          :value="item.route"
          as-child
        >
          <template v-if="item.action">
            <BaseButton
              type="button"
              class="nav-item"
              :aria-label="item.label"
              @click="handleAction(item.action)"
            >
              <span class="nav-item__icon-wrapper">
                <span class="nav-item__icon">{{ item.icon }}</span>
                <span v-if="item.badge" class="nav-item__badge" aria-hidden="true"></span>
              </span>
              <span class="nav-item__label">{{ item.label }}</span>
            </BaseButton>
          </template>
          <template v-else>
            <NuxtLink :to="item.route" class="nav-item" :aria-label="item.label">
              <span class="nav-item__icon-wrapper">
                <span class="nav-item__icon">{{ item.icon }}</span>
                <span v-if="item.badge" class="nav-item__badge" aria-hidden="true"></span>
              </span>
              <span class="nav-item__label">{{ item.label }}</span>
            </NuxtLink>
          </template>
        </BaseTab>
      </BaseTabList>
    </BaseTabs>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

interface NavItem {
  route: string
  label: string
  icon: string
  badge?: boolean
  action?: string
}

const route = useRoute()

const navItems = computed<NavItem[]>(() => [
  {
    route: '/',
    label: 'Home',
    icon: '🏠',
  },
  {
    route: '/plans',
    label: 'Plans',
    icon: '📅',
  },
  {
    route: '/progress',
    label: 'Progress',
    icon: '📈',
  },
  {
    route: '/profile',
    label: 'Profile',
    icon: '👤',
  },
  {
    // Rendered as an action button instead of a link
    route: '/',
    label: 'Sign Out',
    icon: '🚪',
    action: 'signOut',
  },
])

const activeRoute = computed(() => {
  // Match exact route for home, prefix match for others
  const currentPath = route.path
  if (currentPath === '/') return '/'

  const matchedItem = navItems.value.find(
    (item) => item.route !== '/' && currentPath.startsWith(item.route)
  )

  return matchedItem?.route || currentPath
})

const supabase = useSupabaseClient()
const router = useRouter()

async function signOut() {
  // Sign out from Supabase
  try {
    await supabase.auth.signOut()
  } catch (e) {
    // Ignore sign out failures; continue to route to login
    // console.warn('Supabase signOut failed', e)
  }

  await router.push('/login')
}

function handleAction(action?: string) {
  if (!action) return
  if (action === 'signOut') {
    void signOut()
  }
}
</script>

<style scoped>
/* Navigation - horizontal bottom on mobile, vertical right on desktop */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  background-color: #1a1a1a;
  border-top: 1px solid #333;
  z-index: 1000;
  padding-bottom: env(safe-area-inset-bottom); /* For iOS notch */
}

/* Dock item styling */
.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  min-width: 3.5rem;
  min-height: 3.5rem;
  padding: 0.5rem;
  border-radius: 1rem;
  text-decoration: none;
  transition: all 250ms cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  border: none; /* Reset button border */
  background: transparent; /* Reset button background */

  /* High contrast dark text on light background */
  color: rgba(255, 255, 255, 0.6);
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.95);
}

.nav-item:focus-visible {
  outline: 2px solid var(--p-primary-color);
  outline-offset: 2px;
}

/* Active state - macOS dock active indicator */
.nav-item.router-link-active {
  color: #ffffff; /* White text for active state */
  font-weight: 600;
}

/* Mobile: indicator below */
@media (max-width: 768px) {
  .nav-item.router-link-active::after {
    content: '';
    position: absolute;
    bottom: -0.5rem;
    left: 50%;
    transform: translateX(-50%);
    width: 0.25rem;
    height: 0.25rem;
    background: #d4ff00; /* Primary lime for indicator */
    border-radius: 50%;
    animation: dock-indicator 300ms ease-out;
    box-shadow: 0 0 8px #d4ff00; /* Glow effect */
  }
}

/* Desktop: indicator to the left */
@media (min-width: 769px) {
  .nav-item.router-link-active::after {
    content: '';
    position: absolute;
    left: -0.5rem;
    top: 50%;
    transform: translateY(-50%);
    width: 0.25rem;
    height: 0.25rem;
    background: #d4ff00; /* Primary lime for indicator */
    border-radius: 50%;
    animation: dock-indicator 300ms ease-out;
    box-shadow: 0 0 8px #d4ff00; /* Glow effect */
  }
}

@keyframes dock-indicator {
  0% {
    opacity: 0;
    transform: translateX(-50%) scale(0);
  }
  100% {
    opacity: 1;
    transform: translateX(-50%) scale(1);
  }
}

.nav-item.router-link-active .nav-item__icon-wrapper {
  background: rgba(255, 255, 255, 0.15); /* Subtle light background */
  border-radius: 0.875rem;
  padding: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.nav-item__icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 250ms cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-item__icon {
  font-size: 1.5rem;
}

.nav-item__badge {
  position: absolute;
  top: -0.125rem;
  right: -0.125rem;
  width: 0.5rem;
  height: 0.5rem;
  background: #ef4444;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.9);
  animation: pulse 2s ease-in-out infinite;
  box-shadow: 0 0 0.5rem rgba(239, 68, 68, 0.5);
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.15);
  }
}

.nav-item__label {
  font-size: 0.625rem;
  line-height: 1;
  text-align: center;
  white-space: nowrap;
  opacity: 0;
  transition: all 200ms ease;
  position: absolute;
  background: rgba(15, 23, 42, 0.9);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  pointer-events: none;
  font-weight: 500;
  z-index: 10;
}

/* Mobile: label below */
@media (max-width: 768px) {
  .nav-item__label {
    bottom: -1.75rem;
    left: 50%;
    transform: translateX(-50%) translateY(-0.25rem);
  }

  .nav-item:hover .nav-item__label {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

/* Desktop: label to the left */
@media (min-width: 769px) {
  .nav-item__label {
    right: calc(100% + 0.75rem);
    top: 50%;
    transform: translateY(-50%) translateX(0.25rem);
  }

  .nav-item:hover .nav-item__label {
    opacity: 1;
    transform: translateY(-50%) translateX(0);
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .nav-item,
  .nav-item__icon-wrapper,
  .nav-item__icon,
  .nav-item__label {
    transition: none;
  }

  .nav-item__badge {
    animation: none;
  }

  .nav-item.router-link-active::after {
    animation: none;
  }
}

/* Small mobile adjustments */
@media (max-width: 640px) {
  .bottom-nav {
    bottom: 0.5rem;
    width: calc(100vw - 1rem);
  }

  .bottom-nav :deep(.p-tablist-tab-list) {
    width: 100%;
    justify-content: space-around;
    padding: 0.625rem 0.75rem;
  }

  .nav-item {
    min-width: 3rem;
    min-height: 3rem;
  }
}
</style>
