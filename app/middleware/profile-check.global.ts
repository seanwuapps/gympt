export default defineNuxtRouteMiddleware(async (to) => {
  const user = useSupabaseUser()

  // Skip check for public routes and onboarding
  const allowedWithoutProfile = ['/login', '/confirm', '/onboarding']
  if (allowedWithoutProfile.includes(to.path)) {
    return
  }

  // Only check if user is authenticated
  if (user.value) {
    try {
      await $fetch('/api/profile')
      // Profile exists, allow access
    } catch (error: any) {
      if (error.statusCode === 404) {
        // No profile found, redirect to onboarding
        return navigateTo('/onboarding')
      }
      // Other errors (network, server), let them through to avoid blocking
      console.error('Profile check error:', error)
    }
  }
})
