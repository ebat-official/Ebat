ALTER TABLE "postCollaborators" RENAME TO "postContributors";--> statement-breakpoint
ALTER TABLE "postContributors" DROP CONSTRAINT "postCollaborators_post_id_post_id_fk";
--> statement-breakpoint
ALTER TABLE "postContributors" DROP CONSTRAINT "postCollaborators_user_id_user_id_fk";
--> statement-breakpoint
DROP INDEX "postCollaborators_postId_userId_idx";--> statement-breakpoint
DROP INDEX "postCollaborators_postId_idx";--> statement-breakpoint
DROP INDEX "postCollaborators_userId_idx";--> statement-breakpoint
ALTER TABLE "postContributors" ADD CONSTRAINT "postContributors_post_id_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "postContributors" ADD CONSTRAINT "postContributors_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "postContributors_postId_userId_idx" ON "postContributors" USING btree ("post_id","user_id");--> statement-breakpoint
CREATE INDEX "postContributors_postId_idx" ON "postContributors" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "postContributors_userId_idx" ON "postContributors" USING btree ("user_id");