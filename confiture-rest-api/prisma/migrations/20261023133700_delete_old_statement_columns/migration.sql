/*
  Warnings:

  - You are about to drop the column `auditorOrganisation` on the `Audit` table. All the data in the column will be lost.
  - You are about to drop the column `contactEmail` on the `Audit` table. All the data in the column will be lost.
  - You are about to drop the column `contactFormUrl` on the `Audit` table. All the data in the column will be lost.
  - You are about to drop the column `contactName` on the `Audit` table. All the data in the column will be lost.
  - You are about to drop the column `derogatedContent` on the `Audit` table. All the data in the column will be lost.
  - You are about to drop the column `initiator` on the `Audit` table. All the data in the column will be lost.
  - You are about to drop the column `notCompliantContent` on the `Audit` table. All the data in the column will be lost.
  - You are about to drop the column `notInScopeContent` on the `Audit` table. All the data in the column will be lost.
  - You are about to drop the column `planActionUrl` on the `Audit` table. All the data in the column will be lost.
  - You are about to drop the column `procedureUrl` on the `Audit` table. All the data in the column will be lost.
  - You are about to drop the column `schemaPluriannuelUrl` on the `Audit` table. All the data in the column will be lost.
  - You are about to drop the column `statementEditionDate` on the `Audit` table. All the data in the column will be lost.
  - You are about to drop the column `statementPublicationDate` on the `Audit` table. All the data in the column will be lost.
  - You are about to drop the column `technologies` on the `Audit` table. All the data in the column will be lost.
  - You are about to drop the column `tools` on the `Audit` table. All the data in the column will be lost.
  - You are about to drop the column `auditUniqueId` on the `TestEnvironment` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[platform,operatingSystem,assistiveTechnology,browser,a11yStatementId]` on the table `TestEnvironment` will be added. If there are existing duplicate values, this will fail.
  - Made the column `a11yStatementId` on table `TestEnvironment` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "TestEnvironment" DROP CONSTRAINT "TestEnvironment_a11yStatementId_fkey";

-- DropForeignKey
ALTER TABLE "TestEnvironment" DROP CONSTRAINT "TestEnvironment_auditUniqueId_fkey";

-- DropIndex
DROP INDEX "TestEnvironment_platform_operatingSystem_assistiveTechnolog_key";

-- AlterTable
ALTER TABLE "Audit" DROP COLUMN "auditorOrganisation",
DROP COLUMN "contactEmail",
DROP COLUMN "contactFormUrl",
DROP COLUMN "contactName",
DROP COLUMN "derogatedContent",
DROP COLUMN "initiator",
DROP COLUMN "notCompliantContent",
DROP COLUMN "notInScopeContent",
DROP COLUMN "planActionUrl",
DROP COLUMN "procedureUrl",
DROP COLUMN "schemaPluriannuelUrl",
DROP COLUMN "statementEditionDate",
DROP COLUMN "statementPublicationDate",
DROP COLUMN "technologies",
DROP COLUMN "tools";

-- AlterTable
ALTER TABLE "TestEnvironment" DROP COLUMN "auditUniqueId",
ALTER COLUMN "a11yStatementId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "TestEnvironment_platform_operatingSystem_assistiveTechnolog_key" ON "TestEnvironment"("platform", "operatingSystem", "assistiveTechnology", "browser", "a11yStatementId");

-- AddForeignKey
ALTER TABLE "TestEnvironment" ADD CONSTRAINT "TestEnvironment_a11yStatementId_fkey" FOREIGN KEY ("a11yStatementId") REFERENCES "A11yStatement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
