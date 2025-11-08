import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'
import { config } from 'dotenv'

// Load .env file
config()

async function runMigrations() {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    console.error('❌ DATABASE_URL environment variable is not set')
    process.exit(1)
  }

  console.log('🔄 Connecting to database...')
  
  // Create connection for migrations
  const migrationClient = postgres(connectionString, { max: 1 })
  const db = drizzle(migrationClient)

  try {
    console.log('🚀 Running migrations...')
    
    await migrate(db, { migrationsFolder: './db/migrations' })
    
    console.log('✅ All migrations applied successfully!')
  } catch (error) {
    console.error('❌ Error running migrations:', error)
    process.exit(1)
  } finally {
    await migrationClient.end()
  }
}

runMigrations()
