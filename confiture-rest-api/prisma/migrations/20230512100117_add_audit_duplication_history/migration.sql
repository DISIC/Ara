-- AlterTable
ALTER TABLE "Audit" ADD COLUMN     "sourceAuditId" INTEGER;

-- AddForeignKey
ALTER TABLE "Audit" ADD CONSTRAINT "Audit_sourceAuditId_fkey" FOREIGN KEY ("sourceAuditId") REFERENCES "Audit"("id") ON DELETE SET NULL ON UPDATE CASCADE;
