/*
  Warnings:

  - You are about to drop the column `thumbnailUrl` on the `AuditFile` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `AuditFile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AuditFile" DROP COLUMN "thumbnailUrl",
DROP COLUMN "url";
