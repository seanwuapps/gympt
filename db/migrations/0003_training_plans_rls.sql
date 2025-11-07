-- Add foreign key constraint to training_plans
ALTER TABLE training_plans
  ADD CONSTRAINT training_plans_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;

-- Enable RLS on training_plans
ALTER TABLE training_plans ENABLE ROW LEVEL SECURITY;

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
