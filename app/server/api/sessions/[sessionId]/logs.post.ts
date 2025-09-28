import { defineEventHandler, readBody, createError, setResponseStatus, getRequestURL } from 'h3'
import { z } from 'zod'
import { appendSetLog } from '../../../services/sessionService'

const BodySchema = z.object({
  setIndex: z.number().int().min(0),
  weight: z.number(),
  reps: z.number().int().min(1),
  rpe: z.number().int().min(1).max(10).optional(),
})

export default defineEventHandler(async (event) => {
  let sessionId = event.context.params?.sessionId
  if (!sessionId) {
    const { pathname } = getRequestURL(event)
    const m = pathname.match(/\/sessions\/([^/]+)\/logs$/)
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

  await appendSetLog(sessionId, parsed.data)
  setResponseStatus(event, 204)
  return null
})
