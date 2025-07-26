ALTER TABLE "postEdit" RENAME COLUMN "approval_logs" TO "rejection_log";--> statement-breakpoint
ALTER TABLE "post" RENAME COLUMN "approval_logs" TO "rejection_log";--> statement-breakpoint
DROP INDEX "post_createdAt_idx";--> statement-breakpoint
DROP INDEX "postIdSlug";