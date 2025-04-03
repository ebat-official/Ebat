/*
  Warnings:

  - A unique constraint covering the columns `[id,slug]` on the table `Post` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `UserProfile` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `UserProfile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserProfile" ADD COLUMN     "email" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Post_id_slug_key" ON "Post"("id", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_email_key" ON "UserProfile"("email");
