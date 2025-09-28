import { defineEventHandler, readBody, createError, getRequestURL } from 'h3'
import { z } from 'zod'
import { swapExercise } from '../../../services/sessionService'

const BodySchema = z.object({
  fromExerciseId: z.string().uuid(),
  intent: z.string().trim().min(1).optional(),
})

export default defineEventHandler(async (event) => {
  let sessionId = event.context.params?.sessionId
  if (!sessionId) {
    const { pathname } = getRequestURL(event)
    const match = pathname.match(/\/sessions\/([^/]+)\/swap$/)
    sessionId = match?.[1]
  }
  if (!sessionId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing sessionId in path' })
  }

  const body = await readBody(event)
  const parsed = BodySchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid body', data: parsed.error.flatten() })
  }

  return swapExercise(sessionId, parsed.data)
})
