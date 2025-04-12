/*
  Warnings:

  - A unique constraint covering the columns `[postId,authorId]` on the table `PostEdit` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "PostEdit_postId_authorId_key" ON "PostEdit"("postId", "authorId");
