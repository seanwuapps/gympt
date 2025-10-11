import { z } from 'zod'
import OpenAI from 'openai'
import { defineEventHandler, readBody } from 'h3'

const StrengthTarget = z.object({
  sets: z.number().int().positive(),
  reps: z.union([z.number().int().positive(), z.tuple([z.number(), z.number()])]),
  loadKg: z.number().nonnegative().optional(),
  rir: z.number().min(0).max(5).optional(),
  restSec: z.number().int().positive().optional()
})
const CardioTarget = z.object({ durationMin: z.number(), intensity: z.enum(['easy','moderate','hard']), distanceKm: z.number().optional() })
const HIITTarget = z.object({ rounds: z.number().int(), workSec: z.number().int(), restSec: z.number().int(), modality: z.string() })
const CrossfitTarget = z.object({ format: z.enum(['AMRAP','ForTime','EMOM']), durationMin: z.number(), components: z.array(z.string()) })
const RehabTarget = z.object({ sets: z.number().int(), reps: z.number().int(), painCeiling: z.number().max(3), tempo: z.string().optional() })

const Exercise = z.discriminatedUnion('type', [
  z.object({ type: z.literal('strength'), name: z.string(), targets: StrengthTarget }),
  z.object({ type: z.literal('cardio'), name: z.string(), targets: CardioTarget }),
  z.object({ type: z.literal('hiit'), name: z.string(), targets: HIITTarget }),
  z.object({ type: z.literal('crossfit'), name: z.string(), targets: CrossfitTarget }),
  z.object({ type: z.literal('rehab'), name: z.string(), targets: RehabTarget })
])

const SessionPlan = z.object({ exercises: z.array(Exercise) })

const InputSchema = z.object({
  userProfile: z.object({
    experience: z.enum(['beginner','intermediate','advanced']).default('beginner'),
    units: z.enum(['metric','imperial']).default('metric'),
    equipment: z.array(z.string()).default([]),
    goals: z.array(z.string()).default(['general_strength'])
  }),
  modality: z.enum(['strength','cardio','hiit','crossfit','rehab']),
  day: z.number().int().positive().optional(),
  constraints: z.record(z.any()).default({})
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = InputSchema.safeParse(body)
  if (!parsed.success) {
    return { status: 400, error: 'Invalid input', details: parsed.error.flatten() }
  }

  const apiKey = process.env.OPENAI_API_KEY
  const baseURL = process.env.OPENAI_BASE_URL
  const model = process.env.OPENAI_MODEL || '@cf/meta/llama-4-scout-17b-16e-instruct'

  if (!apiKey || !baseURL) {
    // Dev stub when creds are missing
    const stub = { exercises: [ { type: 'strength', name: 'Goblet Squat', targets: { sets: 3, reps: 10, loadKg: 12, restSec: 90 } } ] }
    return SessionPlan.parse(stub)
  }

  const client = new OpenAI({ apiKey, baseURL })
  const prompt = `Generate a JSON session plan strictly matching this schema: ${SessionPlan.toString()}. Modality: ${parsed.data.modality}. Units: ${parsed.data.userProfile.units}. Return ONLY JSON.`

  const completion = await client.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: 'You are a training plan generator. Respond with ONLY JSON matching the provided schema.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.2
  })

  const text = completion.choices?.[0]?.message?.content || '{}'
  let json: unknown
  try {
    json = JSON.parse(text)
  } catch {
    return { status: 502, error: 'AI returned non-JSON response' }
  }
  const result = SessionPlan.safeParse(json)
  if (!result.success) {
    return { status: 502, error: 'AI JSON failed validation', details: result.error.flatten() }
  }
  return result.data
})
