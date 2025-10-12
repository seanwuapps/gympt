<template>
  <div class="profile-container">
    <Card class="profile-card">
      <template #header>
        <div class="card-header">
          <h2>My Profile</h2>
          <Button v-if="!isEditing" label="Edit Profile" @click="startEdit" />
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
            <div class="profile-field">
              <label>Experience Level</label>
              <div class="field-value">{{ profile.experienceLevel }}</div>
            </div>
            <Divider />
            
            <div class="profile-field">
              <label>Preferred Training Days</label>
              <div class="field-value">{{ profile.preferredTrainingDays.join(', ') }}</div>
            </div>
            <Divider />
            
            <div class="profile-field">
              <label>Goals</label>
              <div class="field-value">{{ profile.goals || 'Not specified' }}</div>
            </div>
            <Divider />
            
            <div class="profile-field">
              <label>Progression Pace</label>
              <div class="field-value">{{ profile.aggressiveness }}</div>
            </div>
            <Divider />
            
            <div class="profile-field">
              <label>Injury Flags</label>
              <div class="field-value">{{ profile.injuryFlags || 'None' }}</div>
            </div>
            <Divider />
            
            <div class="profile-field">
              <label>Units</label>
              <div class="field-value">{{ profile.units }}</div>
            </div>
            <Divider />
            
            <div class="profile-field">
              <label>Language</label>
              <div class="field-value">{{ profile.language }}</div>
            </div>
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
                <div class="day-selector">
                  <div 
                    v-for="day in days" 
                    :key="day"
                    class="day-button"
                    :class="{ 'selected': editForm.preferredTrainingDays.includes(day) }"
                  >
                    <Checkbox 
                      v-model="editForm.preferredTrainingDays" 
                      :inputId="`edit-${day}`" 
                      :value="day"
                    />
                    <label :for="`edit-${day}`">{{ day }}</label>
                  </div>
                </div>
              </div>

              <div class="field">
                <label class="field-label">Goals</label>
                <Textarea
                  v-model="editForm.goals"
                  :rows="3"
                  :maxlength="500"
                  class="w-full"
                />
                <small class="char-count">{{ (editForm.goals || '').length }}/500</small>
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
            <i class="pi pi-user" style="font-size: 3rem; color: var(--p-text-muted-color);"></i>
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
const editForm = ref<ProfileFormData>({
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

const languageOptions = [
  { value: 'en', label: 'English' },
]

onMounted(async () => {
  await fetchProfile()
})

const startEdit = () => {
  if (profile.value) {
    editForm.value = {
      goals: profile.value.goals || undefined,
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

<style scoped>
.profile-container {
  padding: 2rem 1rem;
  max-width: 800px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.loading-state {
  padding: 1rem 0;
}

.mb-3 {
  margin-bottom: 1rem;
}

.no-profile {
  padding: 2rem 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem 1rem;
  text-align: center;
}

.empty-state p {
  color: var(--p-text-muted-color);
  font-size: 1.125rem;
  margin: 0;
}

.profile-view {
  padding: 0;
}

.profile-field {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1rem 0;
}

.profile-field label {
  font-weight: 600;
  color: var(--p-text-color);
  min-width: 200px;
}

.profile-field .field-value {
  flex: 1;
  text-align: right;
  color: var(--p-text-muted-color);
}

.profile-edit {
  padding: 1rem 0;
}

.field {
  margin-bottom: 1.5rem;
}

.field-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  font-size: 1rem;
}

.w-full {
  width: 100%;
}

.char-count {
  display: block;
  text-align: right;
  color: var(--p-text-muted-color);
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.day-selector {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.day-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: 2px solid var(--p-surface-border);
  border-radius: var(--p-border-radius);
  cursor: pointer;
  transition: all 0.2s;
}

.day-button:hover {
  border-color: var(--p-primary-color);
  background: var(--p-surface-50);
}

.day-button.selected {
  border-color: var(--p-primary-color);
  background: var(--p-primary-50);
}

.day-button label {
  cursor: pointer;
  font-weight: 600;
  margin: 0;
}

.edit-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--p-surface-border);
  margin-top: 1rem;
}

@media (max-width: 768px) {
  .profile-container {
    padding: 1rem 0.5rem;
  }
  
  .profile-field {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .profile-field label {
    min-width: auto;
  }
  
  .profile-field .field-value {
    text-align: left;
  }
}
</style>
