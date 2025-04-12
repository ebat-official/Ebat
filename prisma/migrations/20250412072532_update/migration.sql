/*
  Warnings:

  - The `subCategory` column on the `PostEdit` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "PostEdit" DROP COLUMN "subCategory",
ADD COLUMN     "subCategory" "SubCategory";
