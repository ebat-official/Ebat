/*
  Warnings:

  - You are about to drop the column `category` on the `PostEdit` table. All the data in the column will be lost.
  - You are about to drop the column `subCategory` on the `PostEdit` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PostEdit" DROP COLUMN "category",
DROP COLUMN "subCategory";
