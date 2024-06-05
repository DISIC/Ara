/*
  Warnings:

  - You are about to drop the column `thumbnailUrl` on the `StoredFile` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `StoredFile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "StoredFile" DROP COLUMN "thumbnailUrl",
DROP COLUMN "url";
