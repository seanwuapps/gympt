<template>
  <div class="container">
    <Card title="My Profile">
      <template #title>
        <div class="">
          <h2>
            My Profile
            <Button
              v-if="!isEditing"
              text
              icon="pi pi-pencil"
              aria-label="Edit Profile"
              @click="startEdit"
            />
          </h2>
        </div>
      </template>

      <template #content>
        <div v-if="loading" class="loading-state">
          <Skeleton height="2rem" class="mb-3" />
          <Skeleton height="2rem" class="mb-3" />
          <Skeleton height="2rem" class="mb-3" />
          <Skeleton height="2rem" class="mb-3" />
          <Skeleton height="2rem" />
        </div>

        <Message v-else-if="error" severity="error" :closable="false">
          {{ error }}
        </Message>

        <div v-else-if="profile">
          <!-- View Mode -->
          <div v-if="!isEditing" class="profile-view">
            <DetailsList :details="profileDetails" />
          </div>

          <!-- Edit Mode -->
          <div v-else class="profile-edit">
            <ProfileEditForm
              :initial-data="editForm"
              :loading="saving"
              @save="saveChanges"
              @cancel="cancelEdit"
            />
          </div>
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

    <!-- Plan Regeneration Prompt Dialog -->
    <Dialog
      v-model:visible="showPlanRegenerationPrompt"
      modal
      :header="getDialogHeader()"
      :style="{ width: '90vw', maxWidth: '30rem' }"
      :closable="!generatingPlan"
    >
      <!-- Loading State -->
      <div v-if="generatingPlan" class="prompt-loading">
        <ProgressSpinner />
        <p class="loading-message">Creating your new training plan...</p>
      </div>

      <!-- Success State -->
      <div v-else-if="generatedPlanId" class="prompt-success">
        <div class="success-icon">
          <i class="pi pi-check-circle" />
        </div>
        <p class="success-message">Your new training plan has been generated and activated!</p>
      </div>

      <!-- Error State -->
      <div v-else-if="generationError" class="prompt-error">
        <div class="error-icon">
          <i class="pi pi-exclamation-triangle" />
        </div>
        <p class="error-message">{{ generationError }}</p>
      </div>

      <!-- Prompt State -->
      <div v-else class="prompt-content">
        <p class="prompt-message">
          Your profile has changed significantly. Would you like to generate a new training plan?
        </p>

        <div v-if="profileChangeSummary.length > 0" class="changes-summary">
          <p class="summary-label">What changed:</p>
          <ul>
            <li v-for="change in profileChangeSummary" :key="change">
              {{ change }}
            </li>
          </ul>
        </div>
      </div>

      <template #footer>
        <!-- Initial Prompt Buttons -->
        <div v-if="!generatingPlan && !generatedPlanId && !generationError">
          <Button label="Keep Current Plan" @click="dismissPrompt" text />
          <Button label="Generate New Plan" @click="generateNewPlan" icon="pi pi-refresh" />
        </div>

        <!-- Success Buttons -->
        <div v-else-if="generatedPlanId">
          <Button label="Close" @click="dismissPrompt" text />
          <Button label="View Plan" @click="viewGeneratedPlan" icon="pi pi-eye" />
        </div>

        <!-- Error Buttons -->
        <div v-else-if="generationError">
          <Button label="Close" @click="dismissPrompt" text />
          <Button label="Try Again" @click="retryGeneration" icon="pi pi-refresh" />
        </div>
      </template>
    </Dialog>

    <Toast />
  </div>
</template>

<script setup lang="ts">
import type { ProfileFormData } from '~/composables/useProfile'
import type { Profile } from '../../db/schema'
import { detectSignificantProfileChanges, getChangeSummary } from '~/utils/profile-changes'
import { usePlansStore } from '~/stores/plans'

import ProfileEditForm from '~/components/profile/ProfileEditForm.vue'

definePageMeta({
  middleware: 'auth',
})

const toast = useToast()
const { profile, loading, error, fetchProfile, saveProfile } = useProfile()
const plansStore = usePlansStore()

const isEditing = ref(false)
const saving = ref(false)

// Plan regeneration prompt state
const showPlanRegenerationPrompt = ref(false)
const profileChangeSummary = ref<string[]>([])
const oldProfileSnapshot = ref<Profile | null>(null)
const generatingPlan = ref(false)
const generatedPlanId = ref<string | null>(null)
const generationError = ref<string | null>(null)

// Data-driven profile details for view mode
const profileDetails = computed(() => {
  if (!profile.value) return []

  return [
    {
      label: 'Experience Level',
      value: profile.value.experienceLevel,
    },
    {
      label: 'Preferred Training Days',
      value: profile.value.preferredTrainingDays.join(', '),
    },
    {
      label: 'Goals',
      value: formatGoals(profile.value.goals),
      defaultValue: 'Not specified',
    },
    {
      label: 'Progression Pace',
      value: profile.value.aggressiveness,
    },
    {
      label: 'Injury Flags',
      value: profile.value.injuryFlags,
      defaultValue: 'None',
    },
    {
      label: 'Units',
      value: profile.value.units,
    },
    {
      label: 'Language',
      value: profile.value.language,
    },
  ]
})
const editForm = ref<ProfileFormData>({
  goals: [],
  experienceLevel: 'beginner',
  preferredTrainingDays: [],
  aggressiveness: 'moderate',
  units: 'metric',
  language: 'en',
})

onMounted(async () => {
  await fetchProfile()
  // Fetch plans to check if user has active plan
  await plansStore.fetchPlans()
})

// Convert comma-separated string from DB to array for UI
const parseGoals = (goals: string | null | undefined): string[] => {
  if (!goals) return []
  return goals
    .split(',')
    .map((g) => g.trim())
    .filter(Boolean)
}

// Format goals array for display
const formatGoals = (goals: string | null | undefined): string => {
  if (!goals) return ''
  return goals
}

const startEdit = () => {
  if (profile.value) {
    editForm.value = {
      goals: parseGoals(profile.value.goals),
      experienceLevel: profile.value.experienceLevel,
      preferredTrainingDays: [...profile.value.preferredTrainingDays],
      injuryFlags: profile.value.injuryFlags || undefined,
      units: profile.value.units,
      language: profile.value.language,
      aggressiveness: profile.value.aggressiveness,
    }
    isEditing.value = true
  }
}

const cancelEdit = () => {
  isEditing.value = false
}

const saveChanges = async (formData: ProfileFormData) => {
  saving.value = true

  // Capture old profile before saving
  oldProfileSnapshot.value = profile.value ? { ...profile.value } : null

  try {
    const updatedProfile = await saveProfile(formData)
    isEditing.value = false

    toast.add({
      severity: 'success',
      summary: 'Profile Updated!',
      detail: 'Your changes have been saved successfully.',
      life: 3000,
    })

    // Check if we should prompt for plan regeneration
    if (oldProfileSnapshot.value && updatedProfile) {
      const hasSignificantChanges = detectSignificantProfileChanges(
        oldProfileSnapshot.value,
        updatedProfile
      )

      console.log('[Profile] Checking for plan regeneration prompt:', {
        hasSignificantChanges,
        hasActivePlan: plansStore.hasActivePlan,
        plansCount: plansStore.plans.length,
      })

      // Ensure plans are loaded to check for active plan
      if (plansStore.plans.length === 0) {
        await plansStore.fetchPlans()
      }

      if (hasSignificantChanges && plansStore.hasActivePlan) {
        profileChangeSummary.value = getChangeSummary(oldProfileSnapshot.value, updatedProfile)
        showPlanRegenerationPrompt.value = true
        console.log(
          '[Profile] Showing plan regeneration prompt with changes:',
          profileChangeSummary.value
        )
      } else {
        console.log('[Profile] Not showing prompt - conditions not met')
      }
    }
  } catch (err: any) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: err.message || 'Failed to save changes. Please try again.',
      life: 5000,
    })
  } finally {
    saving.value = false
  }
}

// Plan regeneration prompt handlers
function getDialogHeader() {
  if (generatingPlan.value) return 'Generating Plan'
  if (generatedPlanId.value) return 'Plan Generated!'
  if (generationError.value) return 'Generation Failed'
  return 'Profile Updated'
}

async function generateNewPlan() {
  generatingPlan.value = true
  generationError.value = null

  try {
    // Generate the plan directly
    const newPlan = await plansStore.generatePlan()

    if (newPlan) {
      generatingPlan.value = false
      generatedPlanId.value = newPlan.id
    }
  } catch (err: any) {
    generatingPlan.value = false
    generationError.value = err.message || 'Failed to generate plan. Please try again.'
  }
}

function retryGeneration() {
  generationError.value = null
  generateNewPlan()
}

function viewGeneratedPlan() {
  showPlanRegenerationPrompt.value = false
  // Reset state
  generatedPlanId.value = null
  generationError.value = null
  // Navigate to plans page to view the new plan
  navigateTo('/plans')
}

function dismissPrompt() {
  showPlanRegenerationPrompt.value = false
  // Reset state
  generatedPlanId.value = null
  generationError.value = null

  if (!generatedPlanId.value && !generationError.value) {
    toast.add({
      severity: 'info',
      summary: 'Plan Unchanged',
      detail: 'You can generate a new plan anytime from the Plans page',
      life: 3000,
    })
  }
}
</script>

<style scoped>
.prompt-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.prompt-message {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.95);
  margin: 0;
  line-height: 1.5;
}

.changes-summary {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.5rem;
  padding: var(--spacing-md);
}

.summary-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
  margin: 0 0 var(--spacing-sm) 0;
}

.changes-summary ul {
  margin: 0;
  padding-left: 1.25rem;
  list-style-type: disc;
}

.changes-summary li {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.75);
  line-height: 1.6;
  margin-bottom: 0.25rem;
}

.changes-summary li:last-child {
  margin-bottom: 0;
}

/* Loading state */
.prompt-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-xl) 0;
}

.loading-message {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.85);
  text-align: center;
  margin: 0;
}

/* Success state */
.prompt-success {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-xl) 0;
}

.success-icon {
  font-size: 3rem;
  color: var(--p-green-500);
}

.success-message {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.95);
  text-align: center;
  margin: 0;
  line-height: 1.5;
}

/* Error state */
.prompt-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-xl) 0;
}

.error-icon {
  font-size: 3rem;
  color: var(--p-red-500);
}

.error-message {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.95);
  text-align: center;
  margin: 0;
  line-height: 1.5;
}
</style>
