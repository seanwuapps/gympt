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
            <form>
              <div class="field">
                <label class="field-label">Experience Level</label>
                <Select
                  v-model="editForm.experienceLevel"
                  :options="experienceLevelOptions"
                  optionLabel="label"
                  optionValue="value"
                  class="w-full"
                />
              </div>

              <div class="field">
                <label class="field-label">Preferred Training Days</label>
                <div class="day-cards-grid">
                  <CheckboxCard
                    v-for="day in days"
                    :key="day"
                    v-model="daySelections[day]"
                    :label="day"
                    :inputId="`edit-${day}`"
                    @update:modelValue="updateTrainingDays"
                  />
                </div>
              </div>

              <div class="field">
                <label class="field-label">Goals</label>
                <FormChipGroup v-model="editForm.goals" :options="goalOptions" />
                <small class="help-text">Select all that apply</small>
              </div>

              <div class="field">
                <label class="field-label">Progression Pace</label>
                <Select
                  v-model="editForm.aggressiveness"
                  :options="aggressivenessOptions"
                  optionLabel="label"
                  optionValue="value"
                  class="w-full"
                />
              </div>

              <div class="field">
                <label class="field-label">Injury Flags</label>
                <Textarea
                  v-model="editForm.injuryFlags"
                  :rows="3"
                  :maxlength="300"
                  class="w-full"
                />
                <small class="char-count">{{ (editForm.injuryFlags || '').length }}/300</small>
              </div>

              <div class="field">
                <label class="field-label">Units</label>
                <Select
                  v-model="editForm.units"
                  :options="unitsOptions"
                  optionLabel="label"
                  optionValue="value"
                  class="w-full"
                />
              </div>

              <div class="field">
                <label class="field-label">Language</label>
                <Select
                  v-model="editForm.language"
                  :options="languageOptions"
                  optionLabel="label"
                  optionValue="value"
                  class="w-full"
                />
              </div>
            </form>

            <div class="edit-actions">
              <Button label="Cancel" severity="secondary" @click="cancelEdit" />
              <Button label="Save Changes" :loading="saving" @click="saveChanges" />
            </div>
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
  </div>
</template>

<script setup lang="ts">
import type { ProfileFormData } from '~/composables/useProfile'

definePageMeta({
  middleware: 'auth',
})

const toast = useToast()
const { profile, loading, error, fetchProfile, saveProfile } = useProfile()

const isEditing = ref(false)
const saving = ref(false)

// Day selections for CheckboxCard components
const daySelections = ref<Record<string, boolean>>({
  Mon: false,
  Tue: false,
  Wed: false,
  Thu: false,
  Fri: false,
  Sat: false,
  Sun: false,
})

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

const experienceLevelOptions = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
]

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const aggressivenessOptions = [
  { value: 'conservative', label: 'Conservative' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'aggressive', label: 'Aggressive' },
]

const unitsOptions = [
  { value: 'metric', label: 'Metric (kg/cm)' },
  { value: 'imperial', label: 'Imperial (lb/in)' },
]

const languageOptions = [{ value: 'en', label: 'English' }]

const goalOptions = [
  { value: 'strength', label: 'Build Strength', icon: '💪' },
  { value: 'muscle', label: 'Gain Muscle', icon: '🏋️' },
  { value: 'weight_loss', label: 'Lose Weight', icon: '⚖️' },
  { value: 'endurance', label: 'Improve Endurance', icon: '🏃' },
  { value: 'flexibility', label: 'Increase Flexibility', icon: '🧘' },
  { value: 'athletic', label: 'Athletic Performance', icon: '⚡' },
  { value: 'health', label: 'General Health', icon: '❤️' },
  { value: 'rehab', label: 'Rehabilitation', icon: '🩹' },
]

onMounted(async () => {
  await fetchProfile()
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

const updateTrainingDays = () => {
  // Sync daySelections to editForm.preferredTrainingDays
  editForm.value.preferredTrainingDays = Object.keys(daySelections.value).filter(
    (day) => daySelections.value[day]
  )
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
    // Initialize day selections from preferredTrainingDays
    days.forEach((day) => {
      daySelections.value[day] = profile.value!.preferredTrainingDays.includes(day)
    })
    isEditing.value = true
  }
}

const cancelEdit = () => {
  isEditing.value = false
}

const saveChanges = async () => {
  saving.value = true

  try {
    await saveProfile(editForm.value)
    isEditing.value = false

    toast.add({
      severity: 'success',
      summary: 'Profile Updated!',
      detail: 'Your changes have been saved successfully.',
      life: 3000,
    })
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
</script>
