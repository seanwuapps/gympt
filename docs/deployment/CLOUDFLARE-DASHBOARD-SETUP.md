# Cloudflare Pages Dashboard Setup Guide

## Step-by-Step Setup

### 1. Create Pages Project

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Workers & Pages**
3. Click **Create application**
4. Select **Pages** tab
5. Click **Connect to Git**

### 2. Connect Repository

1. **Authorize GitHub/GitLab** (first time only)
2. **Select your repository**: `seanwuapps/gympt` (or your repo)
3. Click **Begin setup**

### 3. Configure Build Settings

**Project name**: `gympt` (or your preferred name)

**Production branch**: `main` (or your default branch)

**Build settings**:
- **Framework preset**: Select `Nuxt.js` from dropdown
- **Build command**: `pnpm run build`
- **Build output directory**: `.output/public`
- **Root directory**: `/` (leave as default)

**Advanced settings**:
- **Node.js version**: `18` or `20` (recommended)
- **Package manager**: `pnpm` (if available, otherwise it will auto-detect)

### 4. Environment Variables

Click **Add variable** for each of these:

#### Required Variables

| Variable Name | Example Value | Where to Get It |
|--------------|---------------|-----------------|
| `SUPABASE_URL` | `https://xxxxx.supabase.co` | Supabase Dashboard → Settings → API |
| `SUPABASE_ANON_KEY` | `eyJhbGc...` | Supabase Dashboard → Settings → API |
| `OPENAI_API_KEY` | Your Cloudflare AI token | Cloudflare Dashboard → AI → API Tokens |
| `OPENAI_BASE_URL` | `https://api.cloudflare.com/client/v4/accounts/<account_id>/ai/v1` | Replace `<account_id>` with your Cloudflare account ID |
| `OPENAI_MODEL` | `@cf/meta/llama-4-scout-17b-16e-instruct` | Model identifier |
| `DATABASE_URL` | `postgres://user:pass@host:5432/db` | Your PostgreSQL connection string |

**Important**: 
- Add variables to **both** Production and Preview environments
- Click **Save** after adding all variables

### 5. Deploy

1. Click **Save and Deploy**
2. Cloudflare will:
   - Clone your repository
   - Install dependencies with `pnpm`
   - Run `pnpm run build`
   - Deploy to Cloudflare's edge network
3. Wait for build to complete (usually 2-5 minutes)

### 6. Verify Deployment

Once deployed, you'll see:
- **Production URL**: `https://gympt.pages.dev` (or your custom domain)
- **Deployment status**: Success ✅
- **Build logs**: Available for debugging

Click **Visit site** to test your deployment.

## Automatic Deployments

After initial setup:
- **Every push to `main`** → Automatic production deployment
- **Every pull request** → Automatic preview deployment with unique URL
- **Preview URLs** → Automatically commented on PRs

## Common Issues

### Build Fails

**Check**:
1. Node.js version is 18 or higher
2. All environment variables are set correctly
3. Build logs for specific errors

**Fix**:
- Go to **Settings** → **Builds & deployments**
- Update Node.js version if needed
- Retry deployment

### Environment Variables Not Working

**Check**:
1. Variables are set for correct environment (Production/Preview)
2. Variable names match exactly (case-sensitive)
3. No extra spaces in values

**Fix**:
- Go to **Settings** → **Environment variables**
- Edit and re-save variables
- Retry deployment

### Database Connection Issues

**Check**:
1. `DATABASE_URL` is correct
2. Database allows connections from Cloudflare IPs
3. SSL mode is configured correctly

**Fix**:
- Verify connection string format
- Check database firewall rules
- Add `?sslmode=require` to connection string if needed

## Managing Deployments

### View Deployments

1. Go to **Workers & Pages** → Your Project
2. Click **Deployments** tab
3. See all production and preview deployments

### Rollback

1. Find the working deployment
2. Click **⋯** (three dots)
3. Select **Rollback to this deployment**

### Retry Failed Build

1. Click on failed deployment
2. Click **Retry deployment**

## Custom Domain Setup

### Add Custom Domain

1. Go to **Workers & Pages** → Your Project → **Custom domains**
2. Click **Set up a custom domain**
3. Enter your domain (e.g., `app.yourdomain.com`)
4. Follow DNS setup instructions

### DNS Configuration

Cloudflare will provide:
- **CNAME record** to add to your DNS
- Or automatic setup if domain is on Cloudflare

**Example**:
```
Type: CNAME
Name: app
Target: gympt.pages.dev
```

## Monitoring

### Analytics

- Go to **Workers & Pages** → Your Project → **Analytics**
- View:
  - Requests per second
  - Bandwidth usage
  - Response times
  - Error rates

### Function Logs

- Go to **Workers & Pages** → Your Project → **Functions**
- Click **Logs** tab
- Real-time logs from your API routes

### Build Logs

- Click any deployment
- View complete build output
- Debug build issues

## Cost

### Free Tier
- ✅ Unlimited requests
- ✅ 500 builds per month
- ✅ Unlimited bandwidth
- ✅ Automatic HTTPS
- ✅ DDoS protection

### Paid Tier ($20/month)
- ✅ 5,000 builds per month
- ✅ Concurrent builds
- ✅ Priority support

## Next Steps

1. ✅ Set up custom domain
2. ✅ Configure analytics
3. ✅ Set up monitoring alerts
4. ✅ Test preview deployments with PRs
5. ✅ Configure branch deployments if needed

## Support

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Nuxt Deployment Guide](https://nuxt.com/deploy/cloudflare)
- [Community Discord](https://discord.gg/cloudflaredev)
