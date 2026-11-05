-- CreateEnum
CREATE TYPE "AuditReference" AS ENUM ('RGAA_4', 'RGAA_5_Web', 'RGAA_5_Mobile', 'RGAA_5_Document');

-- AlterTable
ALTER TABLE "Audit" ADD COLUMN     "auditReference" "AuditReference" NOT NULL DEFAULT 'RGAA_4';
