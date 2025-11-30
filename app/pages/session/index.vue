<template>
  <div class="session-page">
    <!-- No Session State -->
    <div v-if="!sessionStore.currentSession" class="no-session">
      <BaseCard>
        <template #content>
          <div class="no-session-content">
            <span class="no-session-icon">💪</span>
            <h2>No Active Session</h2>
            <p>Start a training session from the home page</p>
            <BaseButton label="Go to Home" to="/" size="large" />
          </div>
        </template>
      </BaseCard>
    </div>

    <!-- Session Runner -->
    <SessionRunner v-else />
  </div>
</template>

<script setup lang="ts">
import { useSessionStore } from '~/stores/session'
import SessionRunner from '~/components/session/SessionRunner.vue'

definePageMeta({
  middleware: 'auth',
})

const sessionStore = useSessionStore()
const router = useRouter()

// Redirect if no session
onMounted(() => {
  if (!sessionStore.currentSession) {
    router.push('/')
  }
})
</script>

<style scoped>
.session-page {
  min-height: 100vh;
}

.no-session {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  padding: var(--spacing-lg);
}

.no-session-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--spacing-md);
}

.no-session-icon {
  font-size: 4rem;
}

.no-session-content h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  color: var(--p-text-color);
}

.no-session-content p {
  color: var(--p-text-muted-color);
  margin: 0;
}
</style>
