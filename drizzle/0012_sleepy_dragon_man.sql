CREATE TABLE "api_cache" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"key" text NOT NULL,
	"data" jsonb NOT NULL,
	"expires_at" timestamp NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "api_cache_account_id_key_unique" UNIQUE("account_id","key")
);
--> statement-breakpoint
ALTER TABLE "api_cache" ADD CONSTRAINT "api_cache_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;