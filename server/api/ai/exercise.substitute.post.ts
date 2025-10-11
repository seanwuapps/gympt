import { z } from 'zod'
import { defineEventHandler, readBody } from 'h3'

const InputSchema = z.object({
  current: z.object({ type: z.string(), name: z.string(), targets: z.record(z.any()) }),
  constraints: z.object({ equipment: z.array(z.string()).optional(), injury: z.string().optional() }).optional()
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = InputSchema.safeParse(body)
  if (!parsed.success) {
    return { status: 400, error: 'Invalid input', details: parsed.error.flatten() }
  }
  // Stub response for MVP wiring
  return { type: parsed.data.current.type, name: `${parsed.data.current.name} (Substitute)`, targets: parsed.data.current.targets }
})
