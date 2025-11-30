CREATE TABLE "profiles" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"goals" text,
	"experience_level" text DEFAULT 'beginner' NOT NULL,
	"preferred_training_days" jsonb DEFAULT '["Mon","Wed","Fri"]'::jsonb NOT NULL,
	"injury_flags" text,
	"units" text DEFAULT 'metric' NOT NULL,
	"language" text DEFAULT 'en' NOT NULL,
	"aggressiveness" text DEFAULT 'moderate' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "training_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"duration_weeks" integer NOT NULL,
	"weekly_schedule" jsonb NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"plan_id" uuid NOT NULL,
	"week" integer NOT NULL,
	"day_key" text NOT NULL,
	"modality" text NOT NULL,
	"reasons" text,
	"exercises" jsonb NOT NULL,
	"logged_sets" jsonb DEFAULT '[]'::jsonb,
	"exercise_completions" jsonb DEFAULT '[]'::jsonb,
	"status" text DEFAULT 'generated' NOT NULL,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"feedback" jsonb DEFAULT 'null'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
