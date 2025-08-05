ALTER TABLE "commentVote" ADD COLUMN "post_id" varchar(21) NOT NULL;--> statement-breakpoint
ALTER TABLE "commentVote" ADD CONSTRAINT "commentVote_post_id_post_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "commentVote_postId_idx" ON "commentVote" USING btree ("post_id");