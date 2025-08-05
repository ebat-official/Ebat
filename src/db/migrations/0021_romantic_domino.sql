ALTER TABLE "karmaLog" ADD COLUMN "from_user_id" uuid;--> statement-breakpoint
ALTER TABLE "karmaLog" ADD CONSTRAINT "karmaLog_from_user_id_user_id_fk" FOREIGN KEY ("from_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "karmaLog_fromUserId_createdAt_idx" ON "karmaLog" USING btree ("from_user_id","created_at");