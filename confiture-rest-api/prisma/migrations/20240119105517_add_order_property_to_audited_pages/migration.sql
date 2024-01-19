/*
  Warnings:

  - A unique constraint covering the columns `[auditUniqueId,order]` on the table `AuditedPage` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "AuditedPage" ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "AuditedPage_auditUniqueId_order_key" ON "AuditedPage"("auditUniqueId", "order");
