/*
  Warnings:

  - The values [BLOG,CODING] on the enum `PostType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `tags` on the `Post` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PostType_new" AS ENUM ('ARTICLE', 'QUESTION', 'CHALLENGE', 'SYSTEM_DESIGN');
ALTER TABLE "Post" ALTER COLUMN "type" TYPE "PostType_new" USING ("type"::text::"PostType_new");
ALTER TYPE "PostType" RENAME TO "PostType_old";
ALTER TYPE "PostType_new" RENAME TO "PostType";
DROP TYPE "PostType_old";
COMMIT;

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "tags",
ADD COLUMN     "completionDuration" INTEGER,
ADD COLUMN     "topics" TEXT[];

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "name" TEXT;
