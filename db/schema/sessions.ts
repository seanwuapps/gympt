import { pgTable, uuid, text, integer, timestamp, jsonb } from 'drizzle-orm/pg-core'

export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  planId: uuid('plan_id').notNull(),
  week: integer('week').notNull(),
  dayKey: text('day_key').notNull(), // Mon, Tue, Wed, etc.
  modality: text('modality').notNull(), // Push, Pull, Cardio, etc.
  reasons: text('reasons'), // AI explanation for the session
  exercises: jsonb('exercises').$type<SessionExercise[]>().notNull(),
  loggedSets: jsonb('logged_sets').$type<LoggedSet[]>().default([]),
  exerciseCompletions: jsonb('exercise_completions').$type<ExerciseCompletion[]>().default([]),
  status: text('status', {
    enum: ['generated', 'in_progress', 'completed', 'cancelled'],
  })
    .notNull()
    .default('generated'),
  startedAt: timestamp('started_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  feedback: jsonb('feedback').$type<SessionFeedback | null>().default(null),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

// Type definitions for exercises
export interface SessionExercise {
  type: 'strength' | 'cardio' | 'hiit' | 'crossfit' | 'rehab'
  name: string
  section?: 'warmup' | 'working' | 'cardio' | 'cooldown'
  // Strength fields
  sets?: number | null
  reps?: number | [number, number] | null
  loadKg?: number | null
  rir?: number | null
  restSec?: number | null
  // Cardio fields
  durationMin?: number | null
  intensity?: 'easy' | 'moderate' | 'hard' | null
  distanceKm?: number | null
  // HIIT fields
  rounds?: number | null
  workSec?: number | null
  // Crossfit fields
  format?: 'AMRAP' | 'ForTime' | 'EMOM' | null
  components?: string[] | null
  // Rehab fields
  painCeiling?: number | null
  tempo?: string | null
  // HIIT modality
  modality?: string | null
}

// Type definition for session feedback
export interface SessionFeedback {
  sessionRPE?: number // 6-10 Borg RPE scale
  difficulty?: 'too_easy' | 'just_right' | 'too_hard'
  notes?: string
  soreness?: string[]
  injuries?: string[]
  // Skip session fields
  skipReason?: 'rest_day' | 'holiday' | 'sick' | 'injury' | 'busy' | 'other'
  skipNotes?: string
}

// ============================================
// LOGGED SET TYPES (per modality)
// ============================================

// Base logged set (common fields)
interface LoggedSetBase {
  exerciseIndex: number // Which exercise (0-based index)
  setNumber: number // Which set (1-based: 1, 2, 3...)
  startedAt: string // When user started the set (ISO timestamp)
  completedAt: string // When user completed the set (ISO timestamp)
  skipped: boolean // If this set was skipped
  restTakenSec?: number // Actual rest taken before this set (null for set 1)
}

// Strength set
export interface StrengthLoggedSet extends LoggedSetBase {
  type: 'strength'
  reps: number // Actual reps completed
  loadKg: number // Actual load used
}

// Cardio (single "set" per exercise)
export interface CardioLoggedSet extends LoggedSetBase {
  type: 'cardio'
  durationMin: number // Actual duration
  distanceKm?: number // Actual distance (optional)
  intensity: 'easy' | 'moderate' | 'hard'
}

// HIIT round
export interface HIITLoggedSet extends LoggedSetBase {
  type: 'hiit'
  round: number // Which round (1-based)
  workSec: number // Actual work time
  restSec: number // Actual rest time
}

// Rehab set
export interface RehabLoggedSet extends LoggedSetBase {
  type: 'rehab'
  reps: number // Actual reps completed
  painLevel?: number // 0-3 scale (optional)
}

// CrossFit (single completion)
export interface CrossfitLoggedSet extends LoggedSetBase {
  type: 'crossfit'
  completedRounds?: number // For AMRAP
  timeSeconds?: number // For ForTime
}

// Union type for all logged sets
export type LoggedSet =
  | StrengthLoggedSet
  | CardioLoggedSet
  | HIITLoggedSet
  | RehabLoggedSet
  | CrossfitLoggedSet

// ============================================
// EXERCISE COMPLETION (RPE collected per exercise)
// ============================================

export interface ExerciseCompletion {
  exerciseIndex: number
  status: 'completed' | 'skipped'
  rpe?: number // 6-10 scale, asked after exercise completes
  notes?: string // Optional notes for this exercise
}

export type Session = typeof sessions.$inferSelect
export type NewSession = typeof sessions.$inferInsert
