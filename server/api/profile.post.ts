import { serverSupabaseUser } from '#supabase/server'
import { profiles } from '../../db/schema'
import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { z } from 'zod'

const profileSchema = z.object({
  goals: z.string().optional(),
  experienceLevel: z.enum(['beginner', 'intermediate', 'advanced']),
  preferredTrainingDays: z
    .array(z.enum(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']))
    .min(1)
    .max(7),
  injuryFlags: z.string().optional(),
  units: z.enum(['metric', 'imperial']).default('metric'),
  language: z.string().default('en'),
  aggressiveness: z.enum(['conservative', 'moderate', 'aggressive']).default('moderate'),
})

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized',
    })
  }

  const body = await readBody(event)

  // Validate input
  const validationResult = profileSchema.safeParse(body)
  if (!validationResult.success) {
    throw createError({
      statusCode: 400,
      message: 'Invalid profile data',
      data: validationResult.error.issues,
    })
  }

  const profileData = validationResult.data

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
    // Check if profile exists
    const existing = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, user.sub))
      .limit(1)

    let result

    if (existing.length > 0) {
      // Update existing profile
      result = await db
        .update(profiles)
        .set({
          ...profileData,
          updatedAt: new Date(),
        })
        .where(eq(profiles.userId, user.sub))
        .returning()
    } else {
      // Insert new profile
      result = await db
        .insert(profiles)
        .values({
          userId: user.sub,
          ...profileData,
        })
        .returning()
    }

    return result[0]
  } finally {
    await client.end()
  }
})
