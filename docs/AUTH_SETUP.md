# Authentication Setup Guide

## Overview
The app uses Supabase Auth with two sign-in methods:
- **Google OAuth** (primary for MVP)
- **Email OTP** (magic link)

## Pages & Flow

### `/login` (Public)
- Entry point for unauthenticated users
- Offers Google OAuth and Email OTP sign-in
- Auto-redirects to `/` if already logged in (via middleware)

### `/confirm` (Public)
- OAuth callback handler
- Waits for session to populate after OAuth redirect
- Auto-redirects to `/` once authenticated

### `/` (Protected)
- Main app dashboard (protected by auth middleware)
- Shows user email and sign-out button
- Auto-redirects to `/login` if not authenticated

## Middleware (`middleware/auth.ts`)
- Runs on every route navigation
- Protects `/` by redirecting unauthenticated users to `/login`
- Prevents authenticated users from accessing `/login`
- Excludes `/confirm` from redirect logic

## Configuration (`nuxt.config.ts`)
```ts
supabase: {
  redirectOptions: {
    login: '/login',      // where to send unauthenticated users
    callback: '/confirm', // OAuth callback route
    exclude: ['/login', '/confirm'] // routes that skip auto-redirect
  }
}
```

## Environment Variables (`.env`)
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_ANON_KEY=your-anon-key  # same as SUPABASE_KEY
```

## Supabase Dashboard Setup

### 1. Auth URL Configuration
- Go to: Authentication → URL Configuration
- **Site URL**: `http://localhost:3000`
- **Redirect URLs**: Add `http://localhost:3000`

### 2. Enable Google Provider
- Go to: Authentication → Providers → Google
- Toggle **Enable**
- Paste **Client ID** and **Client Secret** from Google Cloud Console
- Save

## Google Cloud Console Setup

### 1. Create OAuth Client
- Go to: APIs & Services → Credentials
- Click: **Create Credentials** → **OAuth client ID**
- Application type: **Web application**
- Name: `GymPT Dev`

### 2. Configure Origins & Redirects
- **Authorized JavaScript origins**:
  - `http://localhost:3000`
- **Authorized redirect URIs**:
  - `http://localhost:3000`
- Create and copy **Client ID** and **Client Secret**

### 3. OAuth Consent Screen
- User Type: **External** (for testing)
- App name: `GymPT`
- Support email: your email
- Scopes: Default (openid, email, profile)
- Test users: Add your Google account email

## Testing the Flow

### Google OAuth
1. Start dev server: `pnpm dev`
2. Navigate to `http://localhost:3000` → redirects to `/login`
3. Click **Sign in with Google**
4. Complete Google OAuth consent
5. Redirected to `/confirm` → then `/` with session

### Email OTP
1. Enter email in the input field
2. Click **Sign in with Email**
3. Check email for magic link
4. Click link → redirected to `/confirm` → then `/`

## Troubleshooting

### "Redirect URI mismatch"
- Ensure Google Cloud authorized redirect URIs exactly match `http://localhost:3000`
- Ensure Supabase redirect URLs include `http://localhost:3000`

### Session not persisting
- Verify `.env` has correct `SUPABASE_URL` and `SUPABASE_KEY`
- Restart dev server after editing `.env`

### "Provider not enabled"
- Confirm Google provider is toggled ON in Supabase dashboard
- Verify Client ID/Secret are correctly pasted

### TypeScript errors in IDE
- These are false positives for Nuxt auto-imports
- Run `pnpm dev` to generate types in `.nuxt/`
- Errors will disappear once types are generated
