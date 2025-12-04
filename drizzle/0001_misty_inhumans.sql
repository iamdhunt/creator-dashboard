CREATE TABLE "history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"date" date NOT NULL,
	"follower_count" integer DEFAULT 0,
	"followers_gained" integer DEFAULT 0,
	"impression_count" integer DEFAULT 0,
	"impressions_gained" integer DEFAULT 0,
	"engagement_rate" real DEFAULT 0,
	"engagement_rate_change" real DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "history" ADD CONSTRAINT "history_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;