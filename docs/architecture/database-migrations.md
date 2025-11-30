# Database Migrations

This project uses **Drizzle ORM** with a migration-based workflow for production-ready database management.

## Overview

- **Schema source of truth**: `db/schema/*.ts` (TypeScript)
- **Migrations folder**: `db/migrations/` (generated SQL)
- **RLS policies**: `db/rls-policies.sql` (manually maintained)
- **Database**: Supabase (PostgreSQL)

## Migration Workflow

### 1. Make Schema Changes

Edit the Drizzle schema files in `db/schema/`:

- `profiles.ts` - User profiles
- `training-plans.ts` - Training plans
- `sessions.ts` - Workout sessions

Example:

```typescript
// db/schema/sessions.ts
export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  // ... add or modify columns here
})
```

### 2. Generate Migration

```bash
pnpm db:generate
```

This compares your schema to the last snapshot and creates a new SQL migration file in `db/migrations/`.

### 3. Apply Migration

```bash
pnpm db:migrate
```

This runs all pending migrations against your database. Migrations are tracked in `drizzle.__drizzle_migrations`.

### 4. Apply RLS Policies (if needed)

```bash
pnpm db:apply-rls
```

Run this after migrations if you've added new tables or need to refresh RLS policies.

## Available Scripts

| Script         | Command                    | Description                            |
| -------------- | -------------------------- | -------------------------------------- |
| `db:generate`  | `drizzle-kit generate`     | Generate migration from schema changes |
| `db:migrate`   | `tsx scripts/migrate.ts`   | Apply pending migrations               |
| `db:studio`    | `drizzle-kit studio`       | Open Drizzle Studio GUI                |
| `db:apply-rls` | `tsx scripts/apply-rls.ts` | Apply RLS policies and FK constraints  |

## Important Notes

### What Drizzle Manages

- Table creation and modifications
- Column types, defaults, constraints
- Migration history tracking

### What Drizzle Does NOT Manage

These are handled separately in `db/rls-policies.sql`:

- **RLS (Row Level Security) policies** - User data isolation
- **Foreign keys to `auth.users`** - Supabase auth integration
- **Custom indexes** - Performance optimization

### Adding a New Table

1. Create schema in `db/schema/new-table.ts`
2. Export from `db/schema/index.ts`
3. Run `pnpm db:generate`
4. Run `pnpm db:migrate`
5. Add RLS policies to `db/rls-policies.sql`
6. Run `pnpm db:apply-rls`

### Adding Columns to Existing Table

1. Edit the schema file (e.g., `db/schema/sessions.ts`)
2. Run `pnpm db:generate`
3. Review generated migration in `db/migrations/`
4. Run `pnpm db:migrate`

### JSONB Columns

For JSONB columns with typed data, use the `$type` modifier:

```typescript
loggedSets: jsonb('logged_sets').$type<LoggedSet[]>().default([]),
```

Define the TypeScript interface in the same file and export it.

## File Structure

```
db/
├── schema/
│   ├── index.ts          # Re-exports all schemas
│   ├── profiles.ts       # User profile schema + types
│   ├── training-plans.ts # Training plan schema + types
│   └── sessions.ts       # Session schema + types
├── migrations/
│   ├── 0000_*.sql        # Initial migration
│   ├── 0001_*.sql        # Subsequent migrations...
│   └── meta/
│       ├── _journal.json # Migration history
│       └── *.snapshot.json
└── rls-policies.sql      # RLS, FKs, indexes (manual)

scripts/
├── migrate.ts            # Migration runner
└── apply-rls.ts          # RLS policy applier
```

## Environment

Requires `DATABASE_URL` in `.env`:

```
DATABASE_URL=postgresql://user:password@host:port/database
```

## Troubleshooting

### Migration fails with "relation already exists"

The migration was partially applied. Check the database state and either:

- Drop and recreate (dev only)
- Manually fix the migration state in `drizzle.__drizzle_migrations`

### Schema out of sync

Run `pnpm db:generate` to create a migration that syncs the schema.

### RLS policies not working

Ensure you've run `pnpm db:apply-rls` after creating new tables.
