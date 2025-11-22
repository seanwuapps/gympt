import { pgTable, uuid, text, integer, timestamp, jsonb, boolean } from 'drizzle-orm/pg-core'

export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  planId: uuid('plan_id').notNull(),
  week: integer('week').notNull(),
  dayKey: text('day_key').notNull(), // Mon, Tue, Wed, etc.
  modality: text('modality').notNull(), // Push, Pull, Cardio, etc.
  reasons: text('reasons'), // AI explanation for the session
  exercises: jsonb('exercises').$type<SessionExercise[]>().notNull(),
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
  sessionRPE?: number // 1-10 scale
  difficulty?: 'too_easy' | 'just_right' | 'too_hard'
  notes?: string
  soreness?: string[]
  injuries?: string[]
}

export type Session = typeof sessions.$inferSelect
export type NewSession = typeof sessions.$inferInsert
