<template>
  <div class="container">
    <Card title="My Profile">
      <template #title>
        <div class="header">
          <h2>My Profile</h2>
          <Button
            label="Edit Profile"
            icon="pi pi-pencil"
            @click="navigateTo('/profile/edit')"
            outlined
          />
        </div>
      </template>

      <template #content>
        <div v-if="profileStore.loading" class="loading-state">
          <Skeleton height="2rem" class="mb-3" />
          <Skeleton height="2rem" class="mb-3" />
          <Skeleton height="2rem" class="mb-3" />
          <Skeleton height="2rem" class="mb-3" />
          <Skeleton height="2rem" />
        </div>

        <Message v-else-if="profileStore.error" severity="error" :closable="false">
          {{ profileStore.error }}
        </Message>

        <div v-else-if="profileStore.profile" class="profile-view">
          <DetailsList :details="profileDetails" />
        </div>

        <div v-else class="no-profile">
          <div class="empty-state">
            <i class="pi pi-user" style="font-size: 3rem; color: var(--p-text-muted-color)"></i>
            <p>No profile found</p>
            <Button label="Create Profile" @click="$router.push('/onboarding')" />
          </div>
        </div>
      </template>
    </Card>

    <Toast />
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
  gap: var(--spacing-sm);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-xl);
  text-align: center;
}

.empty-state p {
  color: var(--p-text-muted-color);
  margin: 0;
}
</style>
