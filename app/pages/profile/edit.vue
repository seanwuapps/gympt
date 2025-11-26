<template>
  <div class="container">
    <BaseCard>
      <template #header>
        <div class="header">
          <BaseButton icon="⬅️" text aria-label="Back to Profile" @click="$router.back()" />
          <h2>Edit Profile</h2>
        </div>
      </template>

      <template #content>
        <div v-if="profileStore.loading" class="loading-state">
          <BaseProgressSpinner />
          <p>Loading your profile...</p>
        </div>

        <BaseMessage v-else-if="profileStore.error" severity="error" :closable="false">
          {{ profileStore.error }}
        </BaseMessage>

        <div v-else-if="profileStore.profile" class="profile-edit">
          <ProfileEditForm
            :initial-data="editForm"
            :loading="saving"
            @save="saveChanges"
            @cancel="cancelEdit"
          />
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
import type { ProfileFormData } from '~/stores/profile.store'
import type { Profile } from '../../../db/schema'
import { detectSignificantProfileChanges, getChangeSummary } from '~/utils/profile-changes'
import { usePlansStore } from '~/stores/plans'
import ProfileEditForm from '~/components/profile/ProfileEditForm.vue'

definePageMeta({
  middleware: 'auth',
})

const toast = useToast()
const router = useRouter()
const profileStore = useProfileStore()
const plansStore = usePlansStore()

const saving = ref(false)
const oldProfileSnapshot = ref<Profile | null>(null)

// Convert comma-separated string from DB to array for UI
const parseGoals = (goals: string | null | undefined): string[] => {
  if (!goals) return []
  return goals
    .split(',')
    .map((g) => g.trim())
    .filter(Boolean)
}

const editForm = ref<ProfileFormData>({
  goals: [],
  experienceLevel: 'beginner',
  preferredTrainingDays: [],
  aggressiveness: 'moderate',
  units: 'metric',
  language: 'en',
})

onMounted(async () => {
  await profileStore.fetchProfile()
  await plansStore.fetchPlans()

  // Initialize form with current profile data
  if (profileStore.profile) {
    editForm.value = {
      goals: parseGoals(profileStore.profile.goals),
      experienceLevel: profileStore.profile.experienceLevel,
      preferredTrainingDays: [...profileStore.profile.preferredTrainingDays],
      injuryFlags: profileStore.profile.injuryFlags || undefined,
      units: profileStore.profile.units,
      language: profileStore.profile.language,
      aggressiveness: profileStore.profile.aggressiveness,
    }
  }
})

const cancelEdit = () => {
  router.back()
}

const saveChanges = async (formData: ProfileFormData) => {
  // Validate: if rehab goal is selected, injury description must be filled
  if (
    formData.goals?.includes('rehab') &&
    (!formData.injuryFlags || formData.injuryFlags.trim() === '')
  ) {
    toast.add({
      severity: 'error',
      summary: 'Injury Description Required',
      detail: 'Please describe your injury or limitation when selecting Rehabilitation as a goal.',
    })
    return
  }

  // Validate: at least one training day must be selected
  if (!formData.preferredTrainingDays || formData.preferredTrainingDays.length === 0) {
    toast.add({
      severity: 'error',
      summary: 'Training Days Required',
      detail: 'Please select at least one preferred training day.',
    })
    return
  }

  saving.value = true

  // Capture old profile before saving
  oldProfileSnapshot.value = profileStore.profile ? { ...profileStore.profile } : null

  try {
    const updatedProfile = await profileStore.saveProfile(formData)

    toast.add({
      severity: 'success',
      summary: 'Profile Updated!',
      detail: 'Your changes have been saved successfully.',
    })

    // Check if we should prompt for plan regeneration
    if (oldProfileSnapshot.value && updatedProfile) {
      const hasSignificantChanges = detectSignificantProfileChanges(
        oldProfileSnapshot.value,
        updatedProfile
      )

      // Ensure plans are loaded to check for active plan
      if (plansStore.plans.length === 0) {
        await plansStore.fetchPlans()
      }

      if (hasSignificantChanges && plansStore.hasActivePlan) {
        const changeSummary = getChangeSummary(oldProfileSnapshot.value, updatedProfile)

        toast.add({
          severity: 'info',
          summary: 'Profile Updated',
          detail:
            'Your profile has changed significantly. Consider generating a new training plan from the Plans page.',
        })
      }
    }

    // Navigate back to profile view
    router.push('/profile')
  } catch (err: any) {
    // Handle validation errors from backend
    if (err.data?.data) {
      const validationErrors = err.data.data
      // Show the first validation error
      const firstError = validationErrors[0]
      toast.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: firstError.message || 'Invalid profile data',
      })
    } else {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: err.message || 'Failed to save changes. Please try again.',
      })
    }
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-xl);
}

.loading-state p {
  color: var(--p-text-muted-color);
  margin: 0;
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
