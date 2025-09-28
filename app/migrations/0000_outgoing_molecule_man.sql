CREATE TABLE "exercises" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(128) NOT NULL,
	"description" text,
	"primary_muscles" jsonb,
	"video_url" varchar(512)
);
--> statement-breakpoint
CREATE TABLE "session_exercise_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"exercise_id" uuid NOT NULL,
	"name" varchar(128) NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "session_feedbacks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"effort_rating" integer NOT NULL,
	"comment" text
);
--> statement-breakpoint
CREATE TABLE "session_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plan_id" uuid NOT NULL,
	"date" date NOT NULL,
	"exercises" jsonb
);
--> statement-breakpoint
CREATE TABLE "session_set_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"exercise_log_id" uuid NOT NULL,
	"set_index" integer NOT NULL,
	"weight" integer NOT NULL,
	"reps" integer NOT NULL,
	"rpe" integer
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"plan_id" uuid,
	"session_plan_id" uuid,
	"date" timestamp with time zone DEFAULT now(),
	"duration_seconds" integer,
	"total_volume" integer
);
--> statement-breakpoint
CREATE TABLE "training_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"weeks" integer NOT NULL,
	"schedule" jsonb,
	"day_purposes" jsonb,
	"rationale" text,
	"status" varchar(16) DEFAULT 'proposed' NOT NULL,
	"recommitable" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "user_profile" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"goals" varchar(32) NOT NULL,
	"experience_level" varchar(16) NOT NULL,
	"preferred_training_days" jsonb,
	"methodology" varchar(64),
	"equipment" jsonb,
	"pr_bench_1rm" integer,
	"pr_squat_1rm" integer,
	"pr_deadlift_1rm" integer,
	"created_at" timestamp with time zone DEFAULT now()
);
