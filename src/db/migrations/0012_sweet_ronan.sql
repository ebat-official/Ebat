DROP INDEX "challengeTemplate_reference_idx";--> statement-breakpoint
DROP INDEX "challengeTemplate_referenceType_idx";--> statement-breakpoint
CREATE UNIQUE INDEX "challengeTemplate_postId_framework_idx" ON "challengeTemplate" USING btree ("post_id","framework","post_edit_id");--> statement-breakpoint
ALTER TABLE "challengeTemplate" DROP COLUMN "reference_type";