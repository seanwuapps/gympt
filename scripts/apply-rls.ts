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
    const rlsSQL = readFileSync(
      join(__dirname, '../db/migrations/0001_rls_policies.sql'),
      'utf-8'
    )

    console.log('🔐 Applying RLS policies...')
    await client.unsafe(rlsSQL)

    console.log('✅ RLS policies applied successfully!')
  } catch (error) {
    console.error('❌ Error applying RLS policies:', error)
    process.exit(1)
  } finally {
    await client.end()
  }
}

applyRLS()
