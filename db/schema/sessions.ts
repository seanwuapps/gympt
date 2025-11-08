import { pgTable, uuid, text, integer, timestamp, jsonb, boolean } from 'drizzle-orm/pg-core'

export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  planId: uuid('plan_id').notNull(),
  week: integer('week').notNull(),
  dayKey: text('day_key').notNull(), // Mon, Tue, Wed, etc.
  modality: text('modality').notNull(), // Push, Pull, Cardio, etc.
  exercises: jsonb('exercises')
    .$type<SessionExercise[]>()
    .notNull(),
  status: text('status', {
    enum: ['generated', 'in_progress', 'completed', 'cancelled'],
  })
    .notNull()
    .default('generated'),
  startedAt: timestamp('started_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  feedback: jsonb('feedback')
    .$type<SessionFeedback | null>()
    .default(null),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

// Type definitions for exercises
export interface StrengthTarget {
  sets: number
  reps: number | [number, number]
  loadKg?: number
  rir?: number
  restSec?: number
}

export interface CardioTarget {
  durationMin: number
  intensity: 'easy' | 'moderate' | 'hard'
  distanceKm?: number
}

export interface HIITTarget {
  rounds: number
  workSec: number
  restSec: number
  modality: string
}

export interface CrossfitTarget {
  format: 'AMRAP' | 'ForTime' | 'EMOM'
  durationMin: number
  components: string[]
}

export interface RehabTarget {
  sets: number
  reps: number
  painCeiling: number
  tempo?: string
}

export type SessionExercise =
  | { type: 'strength'; name: string; targets: StrengthTarget }
  | { type: 'cardio'; name: string; targets: CardioTarget }
  | { type: 'hiit'; name: string; targets: HIITTarget }
  | { type: 'crossfit'; name: string; targets: CrossfitTarget }
  | { type: 'rehab'; name: string; targets: RehabTarget }

// Type definition for session feedback
export interface SessionFeedback {
  sessionRPE?: number // 1-10 scale
  difficulty?: 'too_easy' | 'just_right' | 'too_hard'
  notes?: string
  soreness?: string[]
  injuries?: string[]
}

export type Session = typeof sessions.$inferSelect
export type NewSession = typeof sessions.$inferInsert
