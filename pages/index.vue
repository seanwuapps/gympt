<template>
  <div class="p-6">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>AI Training Companion (MVP)</span>
        </div>
      </template>
      <div class="space-y-4">
        <div v-if="!user">
          <el-button type="primary" @click="signIn">Sign in with Google</el-button>
        </div>
        <div v-else>
          <p>Signed in as: {{ user.email }}</p>
          <el-button @click="signOut">Sign out</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient()
const user = useSupabaseUser()

const signIn = async () => {
  await supabase.auth.signInWithOAuth({ provider: 'google' })
}
const signOut = async () => {
  await supabase.auth.signOut()
}
</script>

<style scoped>
.p-6 { padding: 1.5rem; }
.space-y-4 > * + * { margin-top: 1rem; }
</style>
