export default defineNuxtRouteMiddleware((to) => {
  // Only run on client side to prevent hydration mismatches
  if (import.meta.server) {
    return
  }

  const user = useSupabaseUser()

  // Redirect to login if not authenticated and trying to access protected route
  if (!user.value && to.path !== '/login' && to.path !== '/confirm') {
    return navigateTo('/login')
  }

  // Redirect to home if authenticated and trying to access login
  if (user.value && to.path === '/login') {
    return navigateTo('/')
  }
})
