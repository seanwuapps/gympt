<template>
  <div class="profile-container">
    <el-card class="profile-card">
      <template #header>
        <div class="card-header">
          <span>My Profile</span>
          <el-button v-if="!isEditing" type="primary" @click="startEdit">
            Edit Profile
          </el-button>
        </div>
      </template>

      <div v-if="loading" class="loading-state">
        <el-skeleton :rows="5" animated />
      </div>

      <div v-else-if="error" class="error-state">
        <el-alert :title="error" type="error" :closable="false" />
      </div>

      <div v-else-if="profile">
        <!-- View Mode -->
        <div v-if="!isEditing" class="profile-view">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="Experience Level">
              {{ profile.experienceLevel }}
            </el-descriptions-item>
            <el-descriptions-item label="Preferred Training Days">
              {{ profile.preferredTrainingDays.join(', ') }}
            </el-descriptions-item>
            <el-descriptions-item label="Goals">
              {{ profile.goals || 'Not specified' }}
            </el-descriptions-item>
            <el-descriptions-item label="Progression Pace">
              {{ profile.aggressiveness }}
            </el-descriptions-item>
            <el-descriptions-item label="Injury Flags">
              {{ profile.injuryFlags || 'None' }}
            </el-descriptions-item>
            <el-descriptions-item label="Units">
              {{ profile.units }}
            </el-descriptions-item>
            <el-descriptions-item label="Language">
              {{ profile.language }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- Edit Mode -->
        <div v-else class="profile-edit">
          <el-form :model="editForm" label-position="top">
            <el-form-item label="Experience Level">
              <el-select v-model="editForm.experienceLevel">
                <el-option value="beginner" label="Beginner" />
                <el-option value="intermediate" label="Intermediate" />
                <el-option value="advanced" label="Advanced" />
              </el-select>
            </el-form-item>

            <el-form-item label="Preferred Training Days">
              <el-checkbox-group v-model="editForm.preferredTrainingDays">
                <el-checkbox-button
                  v-for="day in ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']"
                  :key="day"
                  :value="day"
                >
                  {{ day }}
                </el-checkbox-button>
              </el-checkbox-group>
            </el-form-item>

            <el-form-item label="Goals">
              <el-input
                v-model="editForm.goals"
                type="textarea"
                :rows="3"
                :maxlength="500"
                show-word-limit
              />
            </el-form-item>

            <el-form-item label="Progression Pace">
              <el-select v-model="editForm.aggressiveness">
                <el-option value="conservative" label="Conservative" />
                <el-option value="moderate" label="Moderate" />
                <el-option value="aggressive" label="Aggressive" />
              </el-select>
            </el-form-item>

            <el-form-item label="Injury Flags">
              <el-input
                v-model="editForm.injuryFlags"
                type="textarea"
                :rows="3"
                :maxlength="300"
                show-word-limit
              />
            </el-form-item>

            <el-form-item label="Units">
              <el-select v-model="editForm.units">
                <el-option value="metric" label="Metric (kg/cm)" />
                <el-option value="imperial" label="Imperial (lb/in)" />
              </el-select>
            </el-form-item>

            <el-form-item label="Language">
              <el-select v-model="editForm.language">
                <el-option value="en" label="English" />
              </el-select>
            </el-form-item>
          </el-form>

          <div class="edit-actions">
            <el-button @click="cancelEdit">Cancel</el-button>
            <el-button type="primary" :loading="saving" @click="saveChanges">
              Save Changes
            </el-button>
          </div>
        </div>
      </div>

      <div v-else class="no-profile">
        <el-empty description="No profile found">
          <el-button type="primary" @click="$router.push('/onboarding')">
            Create Profile
          </el-button>
        </el-empty>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ElNotification } from 'element-plus'
import type { ProfileFormData } from '~/composables/useProfile'

definePageMeta({
  middleware: 'auth',
})

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

    ElNotification({
      title: 'Profile Updated!',
      message: 'Your changes have been saved successfully.',
      type: 'success',
      duration: 3000,
    })
  } catch (err: any) {
    ElNotification({
      title: 'Error',
      message: err.message || 'Failed to save changes. Please try again.',
      type: 'error',
      duration: 5000,
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

.loading-state,
.error-state,
.no-profile {
  padding: 2rem 0;
}

.profile-view {
  padding: 1rem 0;
}

.profile-edit {
  padding: 1rem 0;
}

.edit-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--el-border-color);
}

@media (max-width: 768px) {
  .profile-container {
    padding: 1rem 0.5rem;
  }
}
</style>
