/*
  Warnings:

  - Added the required column `auditorOrganisation` to the `Audit` table without a default value. This is not possible if the table is not empty.
  - Made the column `auditType` on table `Audit` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Audit" ADD COLUMN     "auditorOrganisation" TEXT NOT NULL,
ALTER COLUMN "auditorName" DROP NOT NULL,
ALTER COLUMN "contactEmail" DROP NOT NULL,
ALTER COLUMN "contactFormUrl" DROP NOT NULL,
ALTER COLUMN "initiator" DROP NOT NULL,
ALTER COLUMN "procedureUrl" DROP NOT NULL,
ALTER COLUMN "auditType" SET NOT NULL;
