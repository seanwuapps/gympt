/**
 * Fake Authentication Composable
 * 
 * Provides a fake user for development/demo purposes.
 * This allows clicking through the app without setting up real authentication.
 */

export const useFakeAuth = () => {
  const getFakeUser = () => {
    if (!process.client) return null
    
    const fakeUserData = localStorage.getItem('fake-auth-user')
    if (!fakeUserData) return null
    
    try {
      return JSON.parse(fakeUserData)
    } catch {
      return null
    }
  }

  const clearFakeAuth = () => {
    if (process.client) {
      localStorage.removeItem('fake-auth-user')
    }
  }

  return {
    getFakeUser,
    clearFakeAuth
  }
}

/**
 * Get current user (real or fake)
 * 
 * This composable returns the real Supabase user if available,
 * otherwise falls back to the fake user for development.
 */
export const useCurrentUser = () => {
  const supabaseUser = useSupabaseUser()
  const { getFakeUser } = useFakeAuth()
  
  const currentUser = computed(() => {
    // Prefer real user over fake user
    if (supabaseUser.value) {
      return supabaseUser.value
    }
    
    // Fall back to fake user
    return getFakeUser()
  })

  return currentUser
}
