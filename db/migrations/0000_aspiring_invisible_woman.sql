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
