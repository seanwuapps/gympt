# Fake Authentication for Development

## Overview

The fake authentication system allows developers and demo users to click through the application without setting up real authentication (Google OAuth or email OTP). This is useful for:

- **Development**: Quick testing without authentication setup
- **Demos**: Showing the app to stakeholders without requiring accounts
- **UI/UX Testing**: Testing user flows without authentication friction

## How It Works

### User Flow

1. Navigate to `/login`
2. Click the **"🎭 Demo Sign In (No Account Required)"** button (only visible in development mode)
3. A fake user session is created in localStorage
4. User is redirected to the home page
5. All protected routes are accessible
6. User can sign out normally

### Technical Implementation

#### 1. Fake User Storage

Fake user data is stored in `localStorage` with the key `fake-auth-user`:

```javascript
{
  id: 'fake-user-[timestamp]',
  email: 'demo@gympt.app',
  user_metadata: {
    full_name: 'Demo User'
  },
  created_at: '[ISO timestamp]'
}
```

#### 2. Authentication Middleware

**File**: `app/middleware/auth.ts`

The auth middleware checks for both real Supabase users and fake auth users:

```typescript
// Check for fake auth user (development only)
let isFakeAuth = false
if (process.client) {
  const fakeUser = localStorage.getItem('fake-auth-user')
  isFakeAuth = !!fakeUser
}

// Consider user authenticated if they have real auth OR fake auth
const isAuthenticated = user.value || isFakeAuth
```

#### 3. Profile Check Middleware

**File**: `app/middleware/profile-check.global.ts`

The profile check middleware skips profile validation for fake auth users, allowing them to access all pages without onboarding:

```typescript
// Skip profile check for fake auth users - they can access everything
if (isFakeAuth) {
  return
}
```

#### 4. Composables

**File**: `app/composables/useFakeAuth.ts`

Two composables are provided:

- **`useFakeAuth()`**: Manages fake auth (get/clear)
- **`useCurrentUser()`**: Returns real user or fake user (prefers real)

```typescript
// Use in components
const user = useCurrentUser() // Works with both real and fake auth
```

#### 5. Login Page

**File**: `app/pages/login.vue`

The login page includes a fake sign-in button that only appears in development mode:

```vue
<Button 
  v-if="isDev"
  label="🎭 Demo Sign In (No Account Required)" 
  icon="pi pi-bolt"
  @click="signInFake" 
  severity="success"
/>
```

## Usage

### For Developers

1. Start the development server: `pnpm dev`
2. Navigate to `http://localhost:3000/login`
3. Click **"🎭 Demo Sign In"**
4. You're now authenticated and can access all pages

### For Production

The fake sign-in button **only appears in development mode** (`process.dev`). In production builds, only real authentication methods are available.

### Sign Out

Signing out clears both real and fake authentication:

```typescript
const signOut = async () => {
  const { clearFakeAuth } = useFakeAuth()
  
  // Clear fake auth if present
  clearFakeAuth()
  
  // Also sign out from Supabase if real user
  await supabase.auth.signOut()
  
  await navigateTo('/login')
}
```

## Limitations

### What Works

✅ Accessing all protected routes  
✅ Viewing UI components  
✅ Testing navigation flows  
✅ Demo presentations  

### What Doesn't Work

❌ **Database operations**: Fake users don't exist in the database  
❌ **API calls requiring user ID**: Will fail without real user  
❌ **Profile data**: No real profile exists  
❌ **Training plans**: Cannot save/load from database  

### Workarounds

For features that require database access:

1. **Mock data**: Use mock data in stores/components
2. **Conditional logic**: Check if user is fake and show placeholder content
3. **Demo mode**: Create a demo mode that uses local storage instead of database

## Security

### Development Only

The fake auth system is designed for **development and demo purposes only**:

- Button only visible when `process.dev === true`
- Should never be deployed to production
- No security vulnerabilities as it's client-side only

### Production Safety

In production:
- `process.dev` is `false`
- Fake sign-in button is hidden
- Middleware still checks for fake auth (defensive programming)
- Real authentication is required

## Extending Fake Auth

### Adding Mock Data

To make fake auth more useful, you can add mock data:

```typescript
// In stores or composables
const user = useCurrentUser()

if (user.value?.email === 'demo@gympt.app') {
  // Return mock data instead of API calls
  return {
    plans: mockPlans,
    profile: mockProfile
  }
}
```

### Custom Fake Users

Modify `signInFake()` in `login.vue` to create different fake users:

```typescript
const signInFake = async (userType = 'default') => {
  const fakeUsers = {
    default: { email: 'demo@gympt.app', name: 'Demo User' },
    beginner: { email: 'beginner@gympt.app', name: 'Beginner User' },
    advanced: { email: 'advanced@gympt.app', name: 'Advanced User' }
  }
  
  const fakeUser = {
    id: 'fake-user-' + Date.now(),
    ...fakeUsers[userType],
    created_at: new Date().toISOString()
  }
  
  localStorage.setItem('fake-auth-user', JSON.stringify(fakeUser))
  await navigateTo('/')
}
```

## Testing

### Manual Testing

1. Sign in with fake auth
2. Navigate through all pages
3. Test sign out
4. Verify redirect to login
5. Verify real auth still works

### Automated Testing

```typescript
// Example Playwright test
test('fake auth allows access to protected routes', async ({ page }) => {
  await page.goto('/login')
  await page.click('text=Demo Sign In')
  await expect(page).toHaveURL('/')
  await page.goto('/plans')
  await expect(page).toHaveURL('/plans')
})
```

## Troubleshooting

### Button Not Showing

- Check `process.dev` is `true`
- Verify you're running development server (`pnpm dev`)
- Check browser console for errors

### Still Redirecting to Login

- Check localStorage has `fake-auth-user` key
- Verify middleware is checking for fake auth
- Clear browser cache and try again

### Sign Out Not Working

- Check `clearFakeAuth()` is called
- Verify localStorage is cleared
- Check browser console for errors

## References

- [Nuxt Auth Documentation](https://nuxt.com/docs/guide/directory-structure/middleware)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [localStorage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
