-- Rename approval_logs to rejection_log in posts table
ALTER TABLE "post" RENAME COLUMN "approval_logs" TO "rejection_log";

-- Rename approval_logs to rejection_log in postEdit table
ALTER TABLE "postEdit" RENAME COLUMN "approval_logs" TO "rejection_log"; 