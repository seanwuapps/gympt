-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  plan_id uuid NOT NULL,
  week integer NOT NULL,
  day_key text NOT NULL,
  modality text NOT NULL,
  exercises jsonb NOT NULL,
  status text NOT NULL DEFAULT 'generated' CHECK (status IN ('generated', 'in_progress', 'completed', 'cancelled')),
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  feedback jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add foreign key constraints
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
CREATE INDEX sessions_user_id_idx ON sessions(user_id);
CREATE INDEX sessions_plan_id_idx ON sessions(plan_id);
CREATE INDEX sessions_status_idx ON sessions(status);
CREATE INDEX sessions_created_at_idx ON sessions(created_at DESC);
