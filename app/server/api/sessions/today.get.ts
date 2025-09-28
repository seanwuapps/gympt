import { defineEventHandler, getQuery, createError } from 'h3'
import { z } from 'zod'
import { getTodaySession } from '../../services/sessionService'

const QuerySchema = z.object({
  userId: z.string().uuid(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
})

export default defineEventHandler(async (event) => {
  const parsed = QuerySchema.safeParse(getQuery(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid query', data: parsed.error.flatten() })
  }

  const { userId, date } = parsed.data
  return getTodaySession({ userId, date })
})
