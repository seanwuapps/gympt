<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const supabase = useSupabaseClient()
const email = ref('')
const message = ref('')

const signInWithGoogle = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/confirm`
    }
  })
  if (error) {
    message.value = `Error: ${error.message}`
  }
}

const signInWithOtp = async () => {
  message.value = ''
  const { error } = await supabase.auth.signInWithOtp({
    email: email.value,
    options: {
      emailRedirectTo: `${window.location.origin}/confirm`
    }
  })
  if (error) {
    message.value = `Error: ${error.message}`
  } else {
    message.value = 'Check your email for the login link!'
  }
}
</script>

<template>
  <div class="p-6">
    <el-card style="max-width: 400px; margin: 0 auto;">
      <template #header>
        <div class="card-header">
          <span>Sign In</span>
        </div>
      </template>
      <div class="space-y-4">
        <!-- Google OAuth -->
        <el-button type="primary" @click="signInWithGoogle" style="width: 100%;">
          Sign in with Google
        </el-button>

        <el-divider>OR</el-divider>

        <!-- Email OTP -->
        <el-input
          v-model="email"
          type="email"
          placeholder="Enter your email"
          @keyup.enter="signInWithOtp"
        />
        <el-button @click="signInWithOtp" style="width: 100%;">
          Sign in with Email
        </el-button>

        <el-alert v-if="message" :title="message" type="info" :closable="false" />
      </div>
    </el-card>
  </div>
</template>

