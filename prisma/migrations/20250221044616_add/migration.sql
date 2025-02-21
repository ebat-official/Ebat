/*
  Warnings:

  - You are about to drop the column `status` on the `PostEdit` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "PostApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "approvalLogs" JSONB,
ADD COLUMN     "approvalStatus" "PostApprovalStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "PostEdit" DROP COLUMN "status",
ADD COLUMN     "approvalStatus" "PostApprovalStatus" NOT NULL DEFAULT 'PENDING',
ALTER COLUMN "approvalLogs" DROP NOT NULL;

-- DropEnum
DROP TYPE "PostEditStatus";
