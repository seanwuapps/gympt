import { defineEventHandler, readBody, createError, getRequestURL } from 'h3'
import { z } from 'zod'
import { completeSession } from '../../../services/sessionService'

const BodySchema = z.object({
  feedback: z.object({
    effortRating: z.number().int().min(1).max(5),
    comment: z.string().optional(),
  }),
})

export default defineEventHandler(async (event) => {
  let sessionId = event.context.params?.sessionId
  if (!sessionId) {
    const { pathname } = getRequestURL(event)
    const m = pathname.match(/\/sessions\/([^/]+)\/complete$/)
    sessionId = m?.[1]
  }
  if (!sessionId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing sessionId in path' })
  }

  const body = await readBody(event)
  const parsed = BodySchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid body', data: parsed.error.flatten() })
  }

  return completeSession(sessionId, parsed.data.feedback)
})
