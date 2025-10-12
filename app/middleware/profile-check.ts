export default defineNuxtRouteMiddleware(async (to) => {
  const user = useSupabaseUser()

  // Only check if user is authenticated
  if (!user.value) {
    return
  }

  // Skip check for onboarding, login, and confirm pages
  const excludedPaths = ['/onboarding', '/login', '/confirm']
  if (excludedPaths.includes(to.path)) {
    return
  }

  try {
    // Check if profile exists
    await $fetch('/api/profile', {
      method: 'GET',
    })
  } catch (err: any) {
    // If we get a 404, redirect to onboarding
    if (err.statusCode === 404 || err.status === 404) {
      return navigateTo('/onboarding')
    }
    // For other errors (500, network, etc.), let the page handle it
    // This prevents redirect loops if there's a server error
  }
})
