import { defineEventHandler, readBody, createError } from 'h3'
import { z } from 'zod'
import { generateSessionPlan } from '../../services/sessionService'

const BodySchema = z.object({
  userId: z.string().uuid(),
  planId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = BodySchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid body', data: parsed.error.flatten() })
  }

  return generateSessionPlan(parsed.data)
})
