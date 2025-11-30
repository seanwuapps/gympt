# Tech Stack

- Framework: Nuxt 4 (Vue 3 + TypeScript)
- UI: Custom vanilla component library (`app/components/base/`) - no external UI framework
- Auth/DB: Supabase (Google OAuth, Postgres, RLS)
- ORM: Drizzle ORM (+ drizzle-kit, postgres driver)
- Validation: Zod
- AI: Cloudflare Workers AI (OpenAI-compatible), model: `@cf/meta/llama-3.1-8b-instruct`
- Package manager: pnpm
- State Management: Pinia
- Styling: Custom CSS with design tokens (rem units only, CSS variables)
- Testing: Vitest + Vue Test Utils (later), Playwright E2E (later)
- Hosting: Cloudflare Pages (Nitro preset)

## Base Components

Custom vanilla components in `app/components/base/`:

- `BaseButton` - Buttons with variants (primary, secondary, text, danger)
- `BaseCard` - Content containers
- `BaseDialog` - Modal dialogs
- `BaseSelect` - Dropdown selects
- `BaseTabs` / `BaseTabList` / `BaseTab` - Tab navigation
- `BaseMessage` / `BasePageMessages` - Feedback messages
- `BaseBadge` - Status badges
- `BaseDivider` - Visual separators
- `BaseProgressSpinner` - Loading indicators

## Toast Notifications

Custom `useToast()` composable for notifications (success, error, info, warning).
