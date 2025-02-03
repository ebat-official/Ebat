/*
  Warnings:

  - Changed the type of `subCategory` on the `Post` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "SubCategory" AS ENUM ('JAVASCRIPT', 'HTML', 'CSS', 'REACT');

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "subCategory",
ADD COLUMN     "subCategory" "SubCategory" NOT NULL;
