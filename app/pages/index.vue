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
  <div class="home-container">
    <Card>
      <template #header>
        <div class="card-header">
          <h2>AI Training Companion (MVP)</h2>
        </div>
      </template>
      
      <template #content>
        <div v-if="user">
          <Message severity="success" :closable="false">
            <strong>Welcome!</strong>
            <p>Signed in as: <strong>{{ user.email }}</strong></p>
          </Message>
          <div class="button-group">
            <Button label="My Profile" @click="$router.push('/profile')" />
            <Button label="Sign out" severity="secondary" @click="signOut" />
          </div>
        </div>
        <div v-else>
          <p>Loading...</p>
        </div>
      </template>
    </Card>
  </div>
</template>

<style scoped>
.home-container {
  padding: 2rem 1rem;
  max-width: 800px;
  margin: 0 auto;
}

.card-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.button-group {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

@media (max-width: 768px) {
  .home-container {
    padding: 1rem 0.5rem;
  }
  
  .button-group {
    flex-direction: column;
  }
}
</style>

