<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const supabase = useSupabaseClient()
const user = useSupabaseUser()

const signOut = async () => {
  await supabase.auth.signOut()
  await navigateTo('/login')
}
</script>

<template>
  <div class="p-6">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>AI Training Companion (MVP)</span>
        </div>
      </template>
      <div class="space-y-4">
        <div v-if="user">
          <el-alert title="Welcome!" type="success" :closable="false">
            <p>Signed in as: <strong>{{ user.email }}</strong></p>
          </el-alert>
          <el-button @click="signOut">Sign out</el-button>
        </div>
        <div v-else>
          <p>Loading...</p>
        </div>
      </div>
    </el-card>
  </div>
</template>

