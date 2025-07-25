DROP INDEX "challengeTemplate_postId_framework_idx";--> statement-breakpoint
ALTER TABLE "challengeTemplate" ADD COLUMN "post_edit_id" uuid;--> statement-breakpoint
ALTER TABLE "challengeTemplate" ADD CONSTRAINT "challengeTemplate_post_edit_id_postEdit_id_fk" FOREIGN KEY ("post_edit_id") REFERENCES "public"."postEdit"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "challengeTemplate_postEditId_idx" ON "challengeTemplate" USING btree ("post_edit_id");--> statement-breakpoint
CREATE UNIQUE INDEX "challengeTemplate_postId_framework_idx" ON "challengeTemplate" USING btree ("post_id","framework","post_edit_id");