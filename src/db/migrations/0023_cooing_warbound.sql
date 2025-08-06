-- Update existing SYSTEMDESIGN posts to blogs (temporary valid value)
UPDATE "post" SET "type" = 'blogs' WHERE "type" = 'systemdesign';--> statement-breakpoint
UPDATE "postEdit" SET "type" = 'blogs' WHERE "type" = 'systemdesign';--> statement-breakpoint

-- Create new enum type with updated values
CREATE TYPE "post_type_new" AS ENUM('blogs', 'question', 'challenge', 'hld', 'lld');--> statement-breakpoint

-- Update columns to use new enum type
ALTER TABLE "post" ALTER COLUMN "type" TYPE "post_type_new" USING "type"::text::"post_type_new";--> statement-breakpoint
ALTER TABLE "postEdit" ALTER COLUMN "type" TYPE "post_type_new" USING "type"::text::"post_type_new";--> statement-breakpoint

-- Drop old enum and rename new one
DROP TYPE "public"."post_type";--> statement-breakpoint
ALTER TYPE "post_type_new" RENAME TO "post_type";--> statement-breakpoint

-- Now update the temporary blogs posts back to hld
UPDATE "post" SET "type" = 'hld' WHERE "type" = 'blogs' AND "sub_category" = 'systemdesign';--> statement-breakpoint
UPDATE "postEdit" SET "type" = 'hld' WHERE "type" = 'blogs' AND "sub_category" = 'systemdesign';--> statement-breakpoint