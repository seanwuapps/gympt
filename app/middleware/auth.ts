export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser()
  
  // Check for fake auth user (development only)
  let isFakeAuth = false
  if (process.client) {
    const fakeUser = localStorage.getItem('fake-auth-user')
    isFakeAuth = !!fakeUser
  }

  // Consider user authenticated if they have real auth OR fake auth
  const isAuthenticated = user.value || isFakeAuth

  // Redirect to login if not authenticated and trying to access protected route
  if (!isAuthenticated && to.path !== '/login' && to.path !== '/confirm') {
    return navigateTo('/login')
  }

  // Redirect to home if authenticated and trying to access login
  if (isAuthenticated && to.path === '/login') {
    return navigateTo('/')
  }
})
