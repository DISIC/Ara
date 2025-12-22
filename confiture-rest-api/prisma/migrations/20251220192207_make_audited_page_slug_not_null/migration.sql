/*
  Warnings:

  - A unique constraint covering the columns `[auditUniqueId,slug]` on the table `AuditedPage` will be added. If there are existing duplicate values, this will fail.
  - Made the column `slug` on table `AuditedPage` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "AuditedPage" ALTER COLUMN "slug" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "AuditedPage_auditUniqueId_slug_key" ON "AuditedPage"("auditUniqueId", "slug");
