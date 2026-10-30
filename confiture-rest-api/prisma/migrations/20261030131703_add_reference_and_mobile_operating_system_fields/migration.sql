-- CreateEnum
CREATE TYPE "AuditReference" AS ENUM ('RGAA4', 'RGAA5Web', 'RGAA5Mobile', 'RGAA5Bureautique');

-- CreateEnum
CREATE TYPE "MobileOperatingSystem" AS ENUM ('IOS', 'ANDROID');

-- AlterTable
ALTER TABLE "Audit" ADD COLUMN     "auditReference" "AuditReference" NOT NULL DEFAULT 'RGAA4',
ADD COLUMN     "mobileOperatingSystem" "MobileOperatingSystem";
