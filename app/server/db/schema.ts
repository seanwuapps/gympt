import {
  pgTable,
  uuid,
  text,
  varchar,
  integer,
  timestamp,
  date,
  boolean,
  jsonb,
} from 'drizzle-orm/pg-core'

// User profile (avoid collision with Supabase built-in `users`)
export const userProfile = pgTable('user_profile', {
  id: uuid('id').defaultRandom().primaryKey(),
  goals: varchar('goals', { length: 32 }).notNull(), // strength | hypertrophy | fat-loss | cardio | rehab
  experienceLevel: varchar('experience_level', { length: 16 }).notNull(), // beginner | intermediate | advanced
  preferredTrainingDays: jsonb('preferred_training_days').$type<string[]>(),
  methodology: varchar('methodology', { length: 64 }),
  equipment: jsonb('equipment').$type<string[]>(),
  prBench1RM: integer('pr_bench_1rm'),
  prSquat1RM: integer('pr_squat_1rm'),
  prDeadlift1RM: integer('pr_deadlift_1rm'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

// Exercises catalog
export const exercises = pgTable('exercises', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 128 }).notNull(),
  description: text('description'),
  primaryMuscles: jsonb('primary_muscles').$type<string[]>(),
  videoUrl: varchar('video_url', { length: 512 }),
})

// Generated training plans
export const trainingPlans = pgTable('training_plans', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull(),
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  weeks: integer('weeks').notNull(),
  schedule: jsonb('schedule').$type<string[]>(), // Mon..Sun
  dayPurposes: jsonb('day_purposes').$type<Record<string, string>>(),
  rationale: text('rationale'),
  status: varchar('status', { length: 16 }).notNull().default('proposed'), // proposed | active | completed | archived
  recommitable: boolean('recommitable').default(false),
})

// Generated session plans (per day)
export const sessionPlans = pgTable('session_plans', {
  id: uuid('id').defaultRandom().primaryKey(),
  planId: uuid('plan_id').notNull(),
  date: date('date').notNull(),
  exercises: jsonb('exercises').$type<unknown[]>(), // array of prescriptions
})

// User training sessions (actuals)
export const sessions = pgTable('sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull(),
  planId: uuid('plan_id'),
  sessionPlanId: uuid('session_plan_id'),
  date: timestamp('date', { withTimezone: true }).defaultNow(),
  durationSeconds: integer('duration_seconds'),
  totalVolume: integer('total_volume'),
})

// Exercise logs within a session
export const sessionExerciseLogs = pgTable('session_exercise_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  sessionId: uuid('session_id').notNull(),
  exerciseId: uuid('exercise_id').notNull(),
  name: varchar('name', { length: 128 }).notNull(),
  notes: text('notes'),
})

// Set logs
export const sessionSetLogs = pgTable('session_set_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  exerciseLogId: uuid('exercise_log_id').notNull(),
  setIndex: integer('set_index').notNull(),
  weight: integer('weight').notNull(),
  reps: integer('reps').notNull(),
  rpe: integer('rpe'),
})

// Session feedback
export const sessionFeedbacks = pgTable('session_feedbacks', {
  id: uuid('id').defaultRandom().primaryKey(),
  sessionId: uuid('session_id').notNull(),
  effortRating: integer('effort_rating').notNull(), // 1..5
  comment: text('comment'),
})

// Note: Relations and FKs can be added in migrations; keeping schema minimal per [SF]
