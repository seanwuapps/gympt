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
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  border-top: 1px solid;
  z-index: 1000;
  padding: 0.5rem;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem;
  text-decoration: none;
  background: transparent;
  border: none;
  cursor: pointer;
}

.nav-item__icon {
  font-size: 1.5rem;
}

.nav-item__label {
  font-size: 0.75rem;
}
</style>
