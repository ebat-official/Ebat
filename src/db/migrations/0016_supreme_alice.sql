ALTER TABLE "postEdit" RENAME COLUMN "rejection_log" TO "logs";--> statement-breakpoint
ALTER TABLE "post" RENAME COLUMN "rejection_log" TO "logs";--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "external_links" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "challengeSubmission" ALTER COLUMN "answer_template" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "challengeTemplate" ALTER COLUMN "question_template" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "challengeTemplate" ALTER COLUMN "answer_template" SET DATA TYPE jsonb;--> statement-breakpoint
CREATE INDEX "post_full_search_idx" ON "post" USING gin ((
				setweight(to_tsvector('english', "title"), 'A')
			));