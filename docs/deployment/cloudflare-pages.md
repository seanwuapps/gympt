# Cloudflare Pages Deployment Guide

## Overview

This Nuxt app is configured to deploy to Cloudflare Pages using the Nitro Cloudflare Pages preset.

## Prerequisites

1. **Cloudflare Account** - Sign up at [cloudflare.com](https://cloudflare.com)
2. **Wrangler CLI** - Already installed as dev dependency
3. **Environment Variables** - Set up in Cloudflare dashboard

## Configuration Files

### `nuxt.config.ts`
- **Nitro preset**: `cloudflare-pages` - Optimizes build for Cloudflare Pages
- Generates proper output structure in `.output/public`

### `wrangler.toml`
- Project name and compatibility date
- Build output directory configuration
- Build command specification

## Deployment Methods

### Method 1: CLI Deployment (Recommended for First Deploy)

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Authenticate with Cloudflare**:
   ```bash
   pnpm wrangler login
   ```

3. **Deploy to production**:
   ```bash
   pnpm run deploy
   ```

4. **Deploy preview**:
   ```bash
   pnpm run deploy:preview
   ```

### Method 2: Git Integration (Recommended for CI/CD)

1. **Connect Repository**:
   - Go to Cloudflare Dashboard → Pages
   - Click "Create a project" → "Connect to Git"
   - Select your repository

2. **Build Configuration**:
   - **Framework preset**: Nuxt.js
   - **Build command**: `pnpm run build`
   - **Build output directory**: `.output/public`
   - **Root directory**: `/` (or your project root)
   - **Node version**: 18 or higher

3. **Environment Variables** (Set in Cloudflare Dashboard):
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   OPENAI_API_KEY=your_cloudflare_ai_token
   OPENAI_BASE_URL=https://api.cloudflare.com/client/v4/accounts/<account_id>/ai/v1
   OPENAI_MODEL=@cf/meta/llama-4-scout-17b-16e-instruct
   DATABASE_URL=your_database_url (if needed)
   ```

## Environment Variables Setup

### In Cloudflare Dashboard:

1. Go to **Workers & Pages** → Your Project → **Settings** → **Environment Variables**
2. Add each variable for both **Production** and **Preview** environments
3. Click **Save**

### Required Variables:

- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous/public key
- `OPENAI_API_KEY` - Cloudflare AI API token
- `OPENAI_BASE_URL` - Cloudflare AI endpoint
- `OPENAI_MODEL` - AI model identifier
- `DATABASE_URL` - PostgreSQL connection string (for Drizzle)

## Build Process

When you run `pnpm run build`:

1. Nuxt builds with Cloudflare Pages preset
2. Generates optimized output in `.output/public`
3. Creates Cloudflare Workers for server routes
4. Bundles all assets and pages

## Deployment Scripts

- **`pnpm run deploy`** - Build and deploy to production
- **`pnpm run deploy:preview`** - Build and deploy to preview branch

## Post-Deployment

### Custom Domain

1. Go to **Workers & Pages** → Your Project → **Custom domains**
2. Add your domain
3. Update DNS records as instructed

### Functions (API Routes)

- Server API routes in `server/api/` are automatically deployed as Cloudflare Workers
- Each route becomes a serverless function
- Cold start times are typically <50ms

### Database Migrations

**Important**: Run database migrations separately:

```bash
pnpm run db:push
pnpm run db:apply-rls
```

These should be run from your local environment or CI/CD pipeline, not during Cloudflare Pages build.

## Troubleshooting

### Build Fails

- Check Node version (should be 18+)
- Verify all environment variables are set
- Check build logs in Cloudflare dashboard

### Runtime Errors

- Check Functions logs in Cloudflare dashboard
- Verify environment variables are correct
- Ensure Supabase and database are accessible

### Cold Starts

- Cloudflare Pages has excellent cold start performance
- First request may take slightly longer
- Subsequent requests are fast

## Monitoring

- **Analytics**: Cloudflare Dashboard → Pages → Analytics
- **Logs**: Cloudflare Dashboard → Pages → Functions → Logs
- **Performance**: Real User Monitoring (RUM) available

## Rollback

To rollback to a previous deployment:

1. Go to Cloudflare Dashboard → Pages → Deployments
2. Find the working deployment
3. Click **Rollback to this deployment**

## CI/CD Integration

For automated deployments:

1. Use Git integration (Method 2 above)
2. Every push to main → production deployment
3. Every PR → preview deployment
4. Preview URLs are automatically generated

## Cost

- **Free tier**: 500 builds/month, unlimited requests
- **Paid tier**: $20/month for more builds
- Functions included in all tiers

## Additional Resources

- [Nuxt Cloudflare Deployment](https://nuxt.com/deploy/cloudflare)
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)
