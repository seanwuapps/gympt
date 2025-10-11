# Local Development Setup Guide

## Prerequisites

- **Node.js** 18+ (LTS recommended)
- **pnpm** 8+ (`npm install -g pnpm`)
- **Git**
- **Supabase account** (free tier works)
- **Cloudflare account** (for Workers AI)
- **Google Cloud account** (for OAuth)

---

## Initial Setup

### 1. Clone & Install

```bash
git clone <repository-url>
cd gympt
pnpm install
```

### 2. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and fill in the required values:

#### Supabase Configuration

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project (or use existing)
3. Navigate to **Settings → API**
4. Copy the following values:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_KEY=your-anon-key-here  # Same as SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**⚠️ Security Note:** Never commit `.env` to git. The service role key should only be used server-side.

#### Cloudflare Workers AI Configuration

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **AI → Workers AI**
3. Get your Account ID from the URL or dashboard
4. Create an API token with Workers AI permissions

```env
OPENAI_API_KEY=your-cloudflare-api-token
OPENAI_BASE_URL=https://api.cloudflare.com/client/v4/accounts/<account_id>/ai/v1
OPENAI_MODEL=@cf/meta/llama-4-scout-17b-16e-instruct
```

Replace `<account_id>` with your actual Cloudflare Account ID.

#### Database Configuration

```env
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
```

Get this from Supabase: **Settings → Database → Connection String → URI**

#### App Configuration

```env
NUXT_APP_URL=http://localhost:3000
```

---

## Google OAuth Setup

### 1. Configure Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Navigate to **APIs & Services → OAuth consent screen**
   - User Type: **External**
   - App name: `GymPT` (or your choice)
   - Support email: your email
   - Add test users (your email for testing)
4. Navigate to **APIs & Services → Credentials**
5. Click **Create Credentials → OAuth client ID**
   - Application type: **Web application**
   - Name: `GymPT Dev`
   - Authorized JavaScript origins:
     - `http://localhost:3000`
   - Authorized redirect URIs:
     - `http://localhost:3000`
6. Copy **Client ID** and **Client Secret**

### 2. Configure Supabase Auth

1. Go to Supabase Dashboard → **Authentication → Providers**
2. Find **Google** and click to expand
3. Enable the provider
4. Paste your Google **Client ID** and **Client Secret**
5. Save

### 3. Configure Supabase URLs

1. Go to **Authentication → URL Configuration**
2. Set **Site URL**: `http://localhost:3000`
3. Add to **Redirect URLs**: `http://localhost:3000`
4. Save

---

## Database Setup

### 1. Create Schema (TODO: Once schema files are created)

```bash
# Generate migration from schema
pnpm db:generate

# Push to Supabase
pnpm db:push

# Or open Drizzle Studio to inspect
pnpm db:studio
```

### 2. Enable Row Level Security (RLS)

In Supabase Dashboard → **Database → Tables**:

For each table, enable RLS and create policies:

```sql
-- Example policy for 'profiles' table
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);
```

**Note:** Detailed RLS policies will be provided with schema implementation.

---

## Running the App

### Development Server

```bash
pnpm dev
```

App will be available at: **http://localhost:3000**

### Build for Production

```bash
pnpm build
pnpm preview
```

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm preview` | Preview production build |
| `pnpm lint` | Run ESLint |
| `pnpm format` | Format code with Prettier |
| `pnpm type-check` | Run TypeScript type checking |
| `pnpm db:generate` | Generate Drizzle migration |
| `pnpm db:push` | Push schema to database |
| `pnpm db:studio` | Open Drizzle Studio |

---

## Project Structure (Nuxt 4)

```
gympt/
├── app/                      # Nuxt 4 srcDir
│   ├── assets/              # Styles, fonts
│   │   └── css/
│   │       └── main.css
│   ├── components/          # Vue components (to be created)
│   ├── composables/         # Composable functions (to be created)
│   ├── layouts/             # Layout components (to be created)
│   ├── middleware/          # Route middleware
│   │   └── auth.ts
│   ├── pages/               # File-based routing
│   │   ├── index.vue
│   │   ├── login.vue
│   │   └── confirm.vue
│   ├── plugins/             # Vue plugins (empty - using modules)
│   ├── types/               # TypeScript types
│   │   └── database.types.ts
│   └── app.vue              # Root component
├── server/                  # Server routes (at root, not in app/)
│   └── api/
│       ├── ai/
│       │   ├── session.generate.post.ts
│       │   └── exercise.substitute.post.ts
│       └── adapt/
│           └── next-session.post.ts
├── db/                      # Database schema & migrations
│   ├── schema/              # Drizzle schema files (to be created)
│   └── migrations/          # Generated migrations
├── docs/                    # Documentation
│   ├── prd.md
│   ├── architecture.md
│   ├── architecture/
│   ├── stories/
│   ├── qa/
│   ├── AUTH_SETUP.md
│   ├── DESIGN_SYSTEM.md
│   └── SETUP.md (this file)
├── public/                  # Static assets
├── .env                     # Environment variables (not in git)
├── .env.example             # Environment template
├── nuxt.config.ts           # Nuxt configuration
├── drizzle.config.ts        # Drizzle ORM configuration
├── package.json
└── tsconfig.json
```

---

## Troubleshooting

### Port Already in Use

If port 3000 is in use, Nuxt will automatically try 3001, 3002, etc.

To force a specific port:
```bash
PORT=3001 pnpm dev
```

### Supabase Connection Issues

- Verify `SUPABASE_URL` and keys are correct
- Check Supabase project is not paused (free tier pauses after inactivity)
- Ensure your IP is allowed (Supabase → Settings → Database → Connection Pooling)

### Google OAuth Redirect Errors

- Ensure redirect URIs in Google Cloud Console exactly match `http://localhost:3000`
- Ensure Supabase redirect URLs include `http://localhost:3000`
- Clear browser cookies and try again

### TypeScript Errors in IDE

- Run `pnpm dev` once to generate `.nuxt/` types
- Restart your IDE/TypeScript server
- Check `tsconfig.json` extends `.nuxt/tsconfig.json`

### Element Plus Components Not Found

- Ensure `@element-plus/nuxt` is in `modules` array in `nuxt.config.ts`
- Restart dev server
- Check browser console for errors

### Database Types Warning

If you see:
```
WARN  Database types configured at "~/types/database.types.ts" but file not found
```

This is resolved—`app/types/database.types.ts` exists as a placeholder. Once you create tables in Supabase, regenerate types:

```bash
supabase gen types typescript --project-id YOUR_PROJECT_ID > app/types/database.types.ts
```

---

## Development Workflow

### 1. Feature Development

1. Create/update story in `docs/stories/`
2. Implement feature following story tasks
3. Write tests (when testing is set up)
4. Run linter: `pnpm lint`
5. Format code: `pnpm format`
6. Commit with descriptive message

### 2. Database Changes

1. Update schema files in `db/schema/`
2. Generate migration: `pnpm db:generate`
3. Review migration in `db/migrations/`
4. Push to database: `pnpm db:push`
5. Update RLS policies in Supabase dashboard
6. Test with multiple users

### 3. Before Committing

```bash
pnpm lint          # Check code style
pnpm type-check    # Verify TypeScript
pnpm build         # Ensure build works
```

---

## Testing (To Be Configured)

### Unit/Integration Tests (Vitest)

```bash
pnpm test          # Run all tests
pnpm test:watch    # Watch mode
pnpm test:coverage # Generate coverage report
```

### E2E Tests (Playwright)

```bash
pnpm test:e2e      # Run E2E tests
pnpm test:e2e:ui   # Run with UI
```

---

## Deployment (Future)

### Vercel/Netlify

1. Connect repository
2. Set environment variables in dashboard
3. Deploy

### Supabase

- Database is already hosted
- Migrations can be applied via CLI or dashboard

---

## Additional Resources

- [Nuxt 4 Documentation](https://nuxt.com/docs/4.x)
- [Supabase Documentation](https://supabase.com/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [Element Plus Documentation](https://element-plus.org)
- [Cloudflare Workers AI](https://developers.cloudflare.com/workers-ai)

---

## Getting Help

- Check `docs/architecture.md` for system design
- Check `docs/AUTH_SETUP.md` for auth-specific setup
- Check `docs/DESIGN_SYSTEM.md` for UI/UX guidelines
- Review existing stories in `docs/stories/`

---

## Security Reminders

- ✅ Never commit `.env` file
- ✅ Service role key only in server routes
- ✅ All AI calls server-side only
- ✅ RLS enabled on all tables
- ✅ Validate all inputs with Zod
- ✅ Test with multiple users to verify data isolation

---

*Last updated: Oct 11, 2025*
