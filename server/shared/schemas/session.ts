import { z } from 'zod'

// Unified exercise schema with flat structure
// All fields are nullable with defaults to support different exercise types
export const SessionExerciseSchema = z.object({
  type: z.enum(['strength', 'cardio', 'hiit', 'crossfit', 'rehab']),
  name: z.string(),
  // Strength fields
  sets: z.number().int().positive().nullable().default(null),
  reps: z
    .union([z.number().int().positive(), z.tuple([z.number(), z.number()])])
    .nullable()
    .default(null),
  loadKg: z.number().nonnegative().nullable().default(null),
  rir: z.number().min(0).max(5).nullable().default(null),
  restSec: z.number().int().positive().nullable().default(null),
  // Cardio fields
  durationMin: z.number().nullable().default(null),
  intensity: z.enum(['easy', 'moderate', 'hard']).nullable().default(null),
  distanceKm: z.number().nullable().default(null),
  // HIIT fields
  rounds: z.number().int().nullable().default(null),
  workSec: z.number().int().nullable().default(null),
  // Crossfit fields
  format: z.enum(['AMRAP', 'ForTime', 'EMOM']).nullable().default(null),
  components: z.array(z.string()).nullable().default(null),
  // Rehab fields
  painCeiling: z.number().max(3).nullable().default(null),
  tempo: z.string().nullable().default(null),
  // HIIT modality
  modality: z.string().nullable().default(null),
  // Section (added for flat structure)
  section: z.enum(['warmup', 'working', 'cooldown']).optional(),
})

// Session feedback schema
export const SessionFeedbackSchema = z.object({
  sessionRPE: z.number().min(1).max(10).optional(),
  difficulty: z.enum(['too_easy', 'just_right', 'too_hard']).optional(),
  notes: z.string().optional(),
  soreness: z.array(z.string()).optional(),
  injuries: z.array(z.string()).optional(),
})

// Logged set schemas (per modality)
const LoggedSetBaseSchema = z.object({
  exerciseIndex: z.number().int().nonnegative(),
  setNumber: z.number().int().positive(),
  startedAt: z.string().datetime(),
  completedAt: z.string().datetime(),
  skipped: z.boolean(),
  restTakenSec: z.number().int().nonnegative().optional(),
})

const StrengthLoggedSetSchema = LoggedSetBaseSchema.extend({
  type: z.literal('strength'),
  reps: z.number().int().nonnegative(),
  loadKg: z.number().nonnegative(),
})

const CardioLoggedSetSchema = LoggedSetBaseSchema.extend({
  type: z.literal('cardio'),
  durationMin: z.number().nonnegative(),
  distanceKm: z.number().nonnegative().optional(),
  intensity: z.enum(['easy', 'moderate', 'hard']),
})

const HIITLoggedSetSchema = LoggedSetBaseSchema.extend({
  type: z.literal('hiit'),
  round: z.number().int().positive(),
  workSec: z.number().int().nonnegative(),
  restSec: z.number().int().nonnegative(),
})

const RehabLoggedSetSchema = LoggedSetBaseSchema.extend({
  type: z.literal('rehab'),
  reps: z.number().int().nonnegative(),
  painLevel: z.number().min(0).max(3).optional(),
})

const CrossfitLoggedSetSchema = LoggedSetBaseSchema.extend({
  type: z.literal('crossfit'),
  completedRounds: z.number().int().nonnegative().optional(),
  timeSeconds: z.number().int().nonnegative().optional(),
})

export const LoggedSetSchema = z.discriminatedUnion('type', [
  StrengthLoggedSetSchema,
  CardioLoggedSetSchema,
  HIITLoggedSetSchema,
  RehabLoggedSetSchema,
  CrossfitLoggedSetSchema,
])

// Exercise completion schema
export const ExerciseCompletionSchema = z.object({
  exerciseIndex: z.number().int().nonnegative(),
  status: z.enum(['completed', 'skipped']),
  rpe: z.number().min(6).max(10).optional(),
  notes: z.string().optional(),
})

// Create session request
export const CreateSessionSchema = z.object({
  planId: z.string().uuid(),
  week: z.number().int().positive(),
  dayKey: z.enum(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']),
  modality: z.enum(['strength', 'cardio', 'hiit', 'crossfit', 'rehab', 'rest']),
  focus: z.string().optional(), // For strength: chest, back, legs, etc.; for cardio: running, cycling, etc. Taken from LLM generated plan
  reasons: z.string().nullable().optional(), // AI explanation for the session
  exercises: z.array(SessionExerciseSchema),
  status: z.enum(['generated', 'in_progress', 'completed', 'cancelled']).default('generated'),
})

// Update session request
export const UpdateSessionSchema = z.object({
  status: z.enum(['generated', 'in_progress', 'completed', 'cancelled']).optional(),
  startedAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
  feedback: SessionFeedbackSchema.optional(),
  loggedSets: z.array(LoggedSetSchema).optional(),
  exerciseCompletions: z.array(ExerciseCompletionSchema).optional(),
})

// List sessions query params
export const ListSessionsQuerySchema = z.object({
  status: z.enum(['generated', 'in_progress', 'completed', 'cancelled']).optional(),
  planId: z.string().uuid().optional(),
  week: z.coerce.number().int().positive().optional(),
  dayKey: z.enum(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']).optional(),
  limit: z.coerce.number().int().positive().max(100).default(50),
  offset: z.coerce.number().int().nonnegative().default(0),
})
