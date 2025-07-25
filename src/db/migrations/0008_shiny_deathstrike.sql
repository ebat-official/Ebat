ALTER TABLE "challengeTemplate" DROP CONSTRAINT "challengeTemplate_post_edit_id_postEdit_id_fk";
--> statement-breakpoint
DROP INDEX "challengeTemplate_postEditId_idx";--> statement-breakpoint
DROP INDEX "challengeTemplate_postId_framework_idx";--> statement-breakpoint
CREATE UNIQUE INDEX "challengeTemplate_postId_framework_idx" ON "challengeTemplate" USING btree ("post_id","framework");--> statement-breakpoint
ALTER TABLE "challengeTemplate" DROP COLUMN "post_edit_id";