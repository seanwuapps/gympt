-- RLS Policies for all tables
-- Run this after migrations: pnpm db:apply-rls

-- ============================================
-- PROFILES TABLE
-- ============================================

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (if any)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own profile
CREATE POLICY "Users can delete own profile"
  ON profiles FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- TRAINING_PLANS TABLE
-- ============================================

-- Add foreign key constraint
ALTER TABLE training_plans
  DROP CONSTRAINT IF EXISTS training_plans_user_id_fkey;

ALTER TABLE training_plans
  ADD CONSTRAINT training_plans_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE training_plans ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (if any)
DROP POLICY IF EXISTS "Users can view own training plans" ON training_plans;
DROP POLICY IF EXISTS "Users can insert own training plans" ON training_plans;
DROP POLICY IF EXISTS "Users can update own training plans" ON training_plans;
DROP POLICY IF EXISTS "Users can delete own training plans" ON training_plans;

-- Users can view their own training plans
CREATE POLICY "Users can view own training plans"
  ON training_plans FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own training plans
CREATE POLICY "Users can insert own training plans"
  ON training_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own training plans
CREATE POLICY "Users can update own training plans"
  ON training_plans FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own training plans
CREATE POLICY "Users can delete own training plans"
  ON training_plans FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- SESSIONS TABLE
-- ============================================

-- Add foreign key constraints
ALTER TABLE sessions
  DROP CONSTRAINT IF EXISTS sessions_user_id_fkey;

ALTER TABLE sessions
  DROP CONSTRAINT IF EXISTS sessions_plan_id_fkey;

ALTER TABLE sessions
  ADD CONSTRAINT sessions_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;

ALTER TABLE sessions
  ADD CONSTRAINT sessions_plan_id_fkey
  FOREIGN KEY (plan_id)
  REFERENCES training_plans(id)
  ON DELETE CASCADE;

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions(user_id);
CREATE INDEX IF NOT EXISTS sessions_plan_id_idx ON sessions(plan_id);
CREATE INDEX IF NOT EXISTS sessions_status_idx ON sessions(status);
CREATE INDEX IF NOT EXISTS sessions_created_at_idx ON sessions(created_at DESC);

-- Enable RLS
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (if any)
DROP POLICY IF EXISTS "Users can view own sessions" ON sessions;
DROP POLICY IF EXISTS "Users can insert own sessions" ON sessions;
DROP POLICY IF EXISTS "Users can update own sessions" ON sessions;
DROP POLICY IF EXISTS "Users can delete own sessions" ON sessions;

-- Users can view their own sessions
CREATE POLICY "Users can view own sessions"
  ON sessions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own sessions
CREATE POLICY "Users can insert own sessions"
  ON sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own sessions
CREATE POLICY "Users can update own sessions"
  ON sessions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own sessions
CREATE POLICY "Users can delete own sessions"
  ON sessions FOR DELETE
  USING (auth.uid() = user_id);