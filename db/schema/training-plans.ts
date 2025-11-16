import { pgTable, uuid, text, integer, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core'

export interface DayPlan {
  modality: 'strength' | 'cardio' | 'hiit' | 'crossfit' | 'rehab' | 'rest'
  focus?: string // For strength: chest, back, legs, arms, shoulders, full_body, push, pull, upper, lower; for cardio: running, cycling, swimming, etc.
}

export const trainingPlans = pgTable('training_plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  name: text('name').notNull(),
  durationWeeks: integer('duration_weeks').notNull(),
  weeklySchedule: jsonb('weekly_schedule')
    .$type<Record<string, Record<string, DayPlan>>>()
    .notNull(),
  isActive: boolean('is_active').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export type TrainingPlan = typeof trainingPlans.$inferSelect
export type NewTrainingPlan = typeof trainingPlans.$inferInsert
