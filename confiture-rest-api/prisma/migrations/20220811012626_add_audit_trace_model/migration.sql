/*
  Warnings:

  - A unique constraint covering the columns `[auditTraceId]` on the table `Audit` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[editUniqueId,consultUniqueId]` on the table `Audit` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `auditTraceId` to the `Audit` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "AuditedPage" DROP CONSTRAINT "AuditedPage_auditUniqueId_fkey";

-- DropForeignKey
ALTER TABLE "Recipent" DROP CONSTRAINT "Recipent_auditUniqueId_fkey";

-- DropForeignKey
ALTER TABLE "TestEnvironment" DROP CONSTRAINT "TestEnvironment_auditUniqueId_fkey";

-- AlterTable
-- Make column auditTraceId nullable at first
ALTER TABLE "Audit" ADD COLUMN     "auditTraceId" INTEGER;

-- CreateTable
CREATE TABLE "AuditTrace" (
    "id" SERIAL NOT NULL,
    "auditEditUniqueId" TEXT NOT NULL,
    "auditConsultUniqueId" TEXT NOT NULL,

    CONSTRAINT "AuditTrace_pkey" PRIMARY KEY ("id")
);

-- Insert AuditTrace rows for each existing audit
INSERT INTO "AuditTrace" 
  ("auditEditUniqueId", "auditConsultUniqueId")
SELECT 
  "editUniqueId", "consultUniqueId"
FROM "Audit";

-- Update Audit.auditTraceId with newly created auditTrace ids
UPDATE "Audit" as a
SET "auditTraceId" = (
  SELECT t."id" FROM "AuditTrace" as t 
  WHERE 
        t."auditEditUniqueId" = a."editUniqueId" 
    AND t."auditConsultUniqueId" = a."consultUniqueId"
);

-- Make auditTraceId column required
ALTER TABLE "Audit" ALTER COLUMN "auditTraceId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "AuditTrace_auditEditUniqueId_key" ON "AuditTrace"("auditEditUniqueId");

-- CreateIndex
CREATE UNIQUE INDEX "AuditTrace_auditConsultUniqueId_key" ON "AuditTrace"("auditConsultUniqueId");

-- CreateIndex
CREATE UNIQUE INDEX "Audit_auditTraceId_key" ON "Audit"("auditTraceId");

-- CreateIndex
CREATE UNIQUE INDEX "Audit_editUniqueId_consultUniqueId_key" ON "Audit"("editUniqueId", "consultUniqueId");

-- AddForeignKey
ALTER TABLE "Recipent" ADD CONSTRAINT "Recipent_auditUniqueId_fkey" FOREIGN KEY ("auditUniqueId") REFERENCES "Audit"("editUniqueId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Audit" ADD CONSTRAINT "Audit_auditTraceId_fkey" FOREIGN KEY ("auditTraceId") REFERENCES "AuditTrace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestEnvironment" ADD CONSTRAINT "TestEnvironment_auditUniqueId_fkey" FOREIGN KEY ("auditUniqueId") REFERENCES "Audit"("editUniqueId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditedPage" ADD CONSTRAINT "AuditedPage_auditUniqueId_fkey" FOREIGN KEY ("auditUniqueId") REFERENCES "Audit"("editUniqueId") ON DELETE CASCADE ON UPDATE CASCADE;
