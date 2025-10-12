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
  <div class="login-container">
    <Card class="login-card">
      <template #header>
        <div class="card-header">
          <h2>Sign In</h2>
        </div>
      </template>
      
      <template #content>
        <div class="login-content">
          <!-- Google OAuth -->
          <Button 
            label="Sign in with Google" 
            icon="pi pi-google"
            @click="signInWithGoogle" 
            class="w-full"
          />

          <Divider align="center">
            <span class="divider-text">OR</span>
          </Divider>

          <!-- Email OTP -->
          <div class="field">
            <InputText
              v-model="email"
              type="email"
              placeholder="Enter your email"
              class="w-full"
              @keyup.enter="signInWithOtp"
            />
          </div>
          
          <Button 
            label="Sign in with Email" 
            severity="secondary"
            @click="signInWithOtp" 
            class="w-full"
          />

          <Message v-if="message" severity="info" :closable="false">
            {{ message }}
          </Message>
        </div>
      </template>
    </Card>
  </div>
</template>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: var(--p-surface-ground);
}

.login-card {
  width: 100%;
  max-width: 400px;
}

.card-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  text-align: center;
}

.login-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.w-full {
  width: 100%;
}

.field {
  margin: 0;
}

.divider-text {
  color: var(--p-text-muted-color);
  font-size: 0.875rem;
}
</style>

