export default defineNuxtRouteMiddleware(async (to, from) => {
  const user = useSupabaseUser()
  
  // Check for fake auth user
  let isFakeAuth = false
  if (process.client) {
    const fakeUser = localStorage.getItem('fake-auth-user')
    isFakeAuth = !!fakeUser
  }

  // Only check if user is authenticated (real or fake)
  if (!user.value && !isFakeAuth) {
    return
  }
  
  // Skip profile check for fake auth users - they can access everything
  if (isFakeAuth) {
    return
  }

  // Skip check for onboarding, login, and confirm pages
  const excludedPaths = ['/onboarding', '/login', '/confirm']
  if (excludedPaths.includes(to.path)) {
    return
  }

  // Use cached profile check to prevent flash
  const hasProfile = useState<boolean | null>('user-has-profile', () => null)

  // If we already checked and know the answer, use it immediately
  if (hasProfile.value === false) {
    return navigateTo('/onboarding')
  }

  // If we haven't checked yet, check now
  if (hasProfile.value === null) {
    try {
      await $fetch('/api/profile', {
        method: 'GET',
      })
      hasProfile.value = true
    } catch (err: any) {
      // If we get a 404, user has no profile
      if (err.statusCode === 404 || err.status === 404) {
        hasProfile.value = false
        return navigateTo('/onboarding')
      }
      // For other errors (500, network, etc.), let the page handle it
      // This prevents redirect loops if there's a server error
    }
  }
})
