DROP INDEX "challengeTemplate_postId_framework_idx";--> statement-breakpoint
ALTER TABLE "challengeTemplate" ADD COLUMN "reference_type" varchar(10) NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "challengeTemplate_reference_idx" ON "challengeTemplate" USING btree ("reference_type","post_id","post_edit_id","framework");--> statement-breakpoint
CREATE INDEX "challengeTemplate_referenceType_idx" ON "challengeTemplate" USING btree ("reference_type");