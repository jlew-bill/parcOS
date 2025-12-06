CREATE TABLE "game_events" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"game_id" varchar NOT NULL,
	"league" varchar NOT NULL,
	"home_team" varchar NOT NULL,
	"away_team" varchar NOT NULL,
	"home_score" integer NOT NULL,
	"away_score" integer NOT NULL,
	"status" varchar NOT NULL,
	"event_data" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "highlights" (
	"id" varchar PRIMARY KEY NOT NULL,
	"game_id" varchar NOT NULL,
	"timestamp" varchar NOT NULL,
	"description" text NOT NULL,
	"team" varchar NOT NULL,
	"event_type" varchar NOT NULL,
	"cmfk_score" real NOT NULL,
	"momentum_delta" integer NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "workspace_states" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"workspace_name" varchar NOT NULL,
	"stack_id" varchar NOT NULL,
	"cards" jsonb NOT NULL,
	"metadata" jsonb,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
