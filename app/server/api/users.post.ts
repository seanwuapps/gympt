import { defineEventHandler, readBody, createError } from 'h3'
import { z } from 'zod'
import type { InferInsertModel } from 'drizzle-orm'
import { db } from '../db/client'
import { userProfile } from '../db/schema'

const UserProfileSchema = z.object({
  id: z.string().uuid().optional(),
  goals: z.enum(['strength', 'hypertrophy', 'fat-loss', 'cardio', 'rehab']),
  experienceLevel: z.enum(['beginner', 'intermediate', 'advanced']),
  preferredTrainingDays: z
    .array(z.enum(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']))
    .optional(),
  methodology: z.string().optional(),
  equipment: z.array(z.string()).optional(),
  prBench1RM: z.number().int().nonnegative().optional(),
  prSquat1RM: z.number().int().nonnegative().optional(),
  prDeadlift1RM: z.number().int().nonnegative().optional(),
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = UserProfileSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid user profile payload',
      data: parsed.error.flatten(),
    })
  }

  type InsertUserProfile = InferInsertModel<typeof userProfile>
  const values = parsed.data as InsertUserProfile
  // Insert or update by id when provided; if no id, insert new row (uuid default)
  const result = await db
    .insert(userProfile)
    .values(values)
    .onConflictDoUpdate({
      target: userProfile.id,
      set: {
        goals: values.goals,
        experienceLevel: values.experienceLevel,
        preferredTrainingDays: values.preferredTrainingDays,
        methodology: values.methodology,
        equipment: values.equipment,
        prBench1RM: values.prBench1RM,
        prSquat1RM: values.prSquat1RM,
        prDeadlift1RM: values.prDeadlift1RM,
      },
    })
    .returning()

  return result[0]
})
