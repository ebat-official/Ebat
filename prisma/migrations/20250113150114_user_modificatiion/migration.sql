/*
  Warnings:

  - You are about to drop the column `companyName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `phoneNumber` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `subscriptionEndDate` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `subscriptionType` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "companyName",
DROP COLUMN "phoneNumber",
DROP COLUMN "subscriptionEndDate",
DROP COLUMN "subscriptionType",
ADD COLUMN     "karmaPoints" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "name" TEXT,
    "jobTitle" TEXT,
    "description" TEXT,
    "companyName" TEXT,
    "phoneNumber" TEXT,
    "image" TEXT,
    "location" TEXT,
    "externalLinks" JSONB,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "UserProfile"("userId");

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
