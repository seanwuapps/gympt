import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { config } from 'dotenv'

// Load .env file
config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function applyRLS() {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    console.error('❌ DATABASE_URL environment variable is not set')
    process.exit(1)
  }

  console.log('🔄 Connecting to database...')
  const client = postgres(connectionString)
  const db = drizzle(client)

  try {
    console.log('📄 Reading RLS policies...')
    const rlsFiles = [
      '0001_rls_policies.sql',
      '0003_training_plans_rls.sql',
      '0005_sessions_rls.sql'
    ]

    for (const file of rlsFiles) {
      console.log(`🔐 Applying ${file}...`)
      try {
        const rlsSQL = readFileSync(
          join(__dirname, '../db/migrations', file),
          'utf-8'
        )
        await client.unsafe(rlsSQL)
        console.log(`✅ ${file} applied successfully!`)
      } catch (error: any) {
        // Ignore "already exists" errors for idempotency
        if (error.message?.includes('already exists')) {
          console.log(`ℹ️  ${file} already applied, skipping...`)
        } else {
          throw error
        }
      }
    }

    console.log('✅ All RLS policies applied successfully!')
  } catch (error) {
    console.error('❌ Error applying RLS policies:', error)
    process.exit(1)
  } finally {
    await client.end()
  }
}

applyRLS()
