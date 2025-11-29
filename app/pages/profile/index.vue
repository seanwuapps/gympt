<template>
  <div class="container">
    <BaseCard>
      <template #header>
        <div class="header">
          <h2>My Profile</h2>
          <BaseButton
            label="Edit Profile"
            icon="✏️"
            @click="navigateTo('/profile/edit')"
            outlined
          />
        </div>
      </template>

      <template #content>
        <div v-if="profileStore.loading" class="loading-state">
          <BaseProgressSpinner />
        </div>

        <BaseMessage v-else-if="profileStore.error" severity="error" :closable="false">
          {{ profileStore.error }}
        </BaseMessage>

        <div v-else-if="profileStore.profile" class="profile-view">
          <DetailsList :details="profileDetails" />
        </div>

        <div v-else class="no-profile">
          <div class="empty-state">
            <span style="font-size: 3rem">👤</span>
            <p>No profile found</p>
            <BaseButton label="Create Profile" to="/onboarding" />
          </div>
        </div>
      </template>
    </BaseCard>

    <BasePageMessages />
  </div>
</template>

<script setup lang="ts">
import type { Profile } from '../../../db/schema'

definePageMeta({
  middleware: 'auth',
})

const profileStore = useProfileStore()

// Data-driven profile details for view mode
const profileDetails = computed(() => {
  if (!profileStore.profile) return []

  return [
    {
      label: 'Experience Level',
      value: profileStore.profile.experienceLevel,
    },
    {
      label: 'Preferred Training Days',
      value: profileStore.profile.preferredTrainingDays.join(', '),
    },
    {
      label: 'Goals',
      value: formatGoals(profileStore.profile.goals),
      defaultValue: 'Not specified',
    },
    {
      label: 'Progression Pace',
      value: profileStore.profile.aggressiveness,
    },
    {
      label: 'Injury Flags',
      value: profileStore.profile.injuryFlags,
      defaultValue: 'None',
    },
    {
      label: 'Units',
      value: profileStore.profile.units,
    },
    {
      label: 'Language',
      value: profileStore.profile.language,
    },
  ]
})

onMounted(async () => {
  await profileStore.fetchProfile()
})

// Format goals array for display
const formatGoals = (goals: string | null | undefined): string => {
  if (!goals) return ''
  return goals
}
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.loading-state {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  text-align: center;
}

.empty-state p {
  margin: 0;
}

.skeleton-line {
  height: 2rem;
  background: linear-gradient(90deg, #444 25%, #555 50%, #444 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 4px;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
