/*
  Warnings:

  - You are about to drop the column `karmaPoints` on the `Post` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Post" DROP COLUMN "karmaPoints",
ADD COLUMN     "coins" INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "coins" INTEGER NOT NULL DEFAULT 0;
