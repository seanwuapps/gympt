import { defineEventHandler, readBody } from 'h3'
import { z } from 'zod'

const SetActual = z.object({ reps: z.number().int().optional(), loadKg: z.number().optional(), rpe: z.number().min(1).max(10).optional(), durationMin: z.number().optional() })
const InputSchema = z.object({
  modality: z.enum(['strength','cardio','hiit','crossfit','rehab']),
  sets: z.array(SetActual),
  sessionRpe: z.number().min(1).max(10).optional()
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = InputSchema.safeParse(body)
  if (!parsed.success) {
    return { status: 400, error: 'Invalid input', details: parsed.error.flatten() }
  }
  // Minimal deterministic adaptation stub
  if (parsed.data.modality === 'strength') {
    const avgRpe = parsed.data.sets.map(s => s.rpe ?? 7).reduce((a,b)=>a+b,0) / (parsed.data.sets.length || 1)
    const adj = avgRpe >= 9 ? -0.05 : avgRpe <= 6 ? 0.03 : 0
    return { adjustment: adj, rule: 'strength-rpe' }
  }
  return { adjustment: 0, rule: 'default' }
})
