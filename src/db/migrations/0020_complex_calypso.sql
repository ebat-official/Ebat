CREATE TYPE "public"."follow_action" AS ENUM('follow', 'unfollow');--> statement-breakpoint
CREATE TYPE "public"."karma_action" AS ENUM('post_approval', 'post_edit_approval', 'post_vote', 'post_vote_removal', 'comment_vote', 'comment_vote_removal');--> statement-breakpoint
CREATE TABLE "karmaLog" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"action" text NOT NULL,
	"karma_change" integer NOT NULL,
	"post_id" varchar(21),
	"comment_id" uuid,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "karmaLog" ADD CONSTRAINT "karmaLog_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "karmaLog" ADD CONSTRAINT "karmaLog_post_id_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "karmaLog" ADD CONSTRAINT "karmaLog_comment_id_comment_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."comment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "karmaLog_userId_createdAt_idx" ON "karmaLog" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "karmaLog_action_createdAt_idx" ON "karmaLog" USING btree ("action","created_at");--> statement-breakpoint
CREATE INDEX "karmaLog_postId_idx" ON "karmaLog" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "karmaLog_commentId_idx" ON "karmaLog" USING btree ("comment_id");