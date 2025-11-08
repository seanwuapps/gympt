import { z } from 'zod'

// Exercise target schemas matching db/schema/sessions.ts
export const StrengthTargetSchema = z.object({
  sets: z.number().int().positive(),
  reps: z.union([z.number().int().positive(), z.tuple([z.number(), z.number()])]),
  loadKg: z.number().nonnegative().nullable().optional(),
  rir: z.number().min(0).max(5).nullable().optional(),
  restSec: z.number().int().positive().nullable().optional()
})

export const CardioTargetSchema = z.object({
  durationMin: z.number().positive(),
  intensity: z.enum(['easy', 'moderate', 'hard']),
  distanceKm: z.number().nonnegative().nullable().optional()
})

export const HIITTargetSchema = z.object({
  rounds: z.number().int().positive(),
  workSec: z.number().int().positive(),
  restSec: z.number().int().positive(),
  modality: z.string()
})

export const CrossfitTargetSchema = z.object({
  format: z.enum(['AMRAP', 'ForTime', 'EMOM']),
  durationMin: z.number().positive(),
  components: z.array(z.string())
})

export const RehabTargetSchema = z.object({
  sets: z.number().int().positive(),
  reps: z.number().int().positive(),
  painCeiling: z.number().max(3),
  tempo: z.string().nullable().optional()
})

// Exercise schema (discriminated union)
export const SessionExerciseSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('strength'), name: z.string(), targets: StrengthTargetSchema }),
  z.object({ type: z.literal('cardio'), name: z.string(), targets: CardioTargetSchema }),
  z.object({ type: z.literal('hiit'), name: z.string(), targets: HIITTargetSchema }),
  z.object({ type: z.literal('crossfit'), name: z.string(), targets: CrossfitTargetSchema }),
  z.object({ type: z.literal('rehab'), name: z.string(), targets: RehabTargetSchema })
])

// Session feedback schema
export const SessionFeedbackSchema = z.object({
  sessionRPE: z.number().min(1).max(10).optional(),
  difficulty: z.enum(['too_easy', 'just_right', 'too_hard']).optional(),
  notes: z.string().optional(),
  soreness: z.array(z.string()).optional(),
  injuries: z.array(z.string()).optional()
})

// Create session request
export const CreateSessionSchema = z.object({
  planId: z.string().uuid(),
  week: z.number().int().positive(),
  dayKey: z.enum(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']),
  modality: z.string(),
  exercises: z.array(SessionExerciseSchema),
  status: z.enum(['generated', 'in_progress', 'completed', 'cancelled']).default('generated')
})

// Update session request
export const UpdateSessionSchema = z.object({
  status: z.enum(['generated', 'in_progress', 'completed', 'cancelled']).optional(),
  startedAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
  feedback: SessionFeedbackSchema.optional()
})

// List sessions query params
export const ListSessionsQuerySchema = z.object({
  status: z.enum(['generated', 'in_progress', 'completed', 'cancelled']).optional(),
  planId: z.string().uuid().optional(),
  limit: z.coerce.number().int().positive().max(100).default(50),
  offset: z.coerce.number().int().nonnegative().default(0)
})
