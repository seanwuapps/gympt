import { serverSupabaseUser } from '#supabase/server'
import { profiles } from '../../db/schema'
import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }

  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw createError({
      statusCode: 500,
      message: 'Database connection not configured',
    })
  }

  const client = postgres(connectionString)
  const db = drizzle(client)

  try {
    const profile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, user.sub))
      .limit(1)

    if (profile.length === 0) {
      throw createError({
        statusCode: 404,
        message: 'Profile not found',
      })
    }

    return profile[0]
  } finally {
    await client.end()
  }
})
