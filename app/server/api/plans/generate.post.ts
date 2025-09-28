import { defineEventHandler, readBody, createError } from 'h3'
import { z } from 'zod'
import { generatePlan } from '../../services/planService'

const BodySchema = z.object({
  userId: z.string().uuid(),
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = BodySchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid body', data: parsed.error.flatten() })
  }

  // Call service to generate plan (minimal logic for MVP)
  return generatePlan(parsed.data.userId)
})
