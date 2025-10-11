import { pgTable, uuid, text, timestamp, jsonb } from 'drizzle-orm/pg-core'

export const profiles = pgTable('profiles', {
  userId: uuid('user_id')
    .primaryKey()
    .notNull(),
  goals: text('goals'),
  experienceLevel: text('experience_level', {
    enum: ['beginner', 'intermediate', 'advanced'],
  })
    .notNull()
    .default('beginner'),
  preferredTrainingDays: jsonb('preferred_training_days')
    .$type<string[]>()
    .notNull()
    .default(['Mon', 'Wed', 'Fri']),
  injuryFlags: text('injury_flags'),
  units: text('units', { enum: ['metric', 'imperial'] })
    .notNull()
    .default('metric'),
  language: text('language').notNull().default('en'),
  aggressiveness: text('aggressiveness', {
    enum: ['conservative', 'moderate', 'aggressive'],
  })
    .notNull()
    .default('moderate'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export type Profile = typeof profiles.$inferSelect
export type NewProfile = typeof profiles.$inferInsert
