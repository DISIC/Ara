/*
  Warnings:

  - You are about to drop the column `auditUniqueId` on the `CriterionResult` table. All the data in the column will be lost.
  - You are about to drop the column `pageUrl` on the `CriterionResult` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[pageId,topic,criterium]` on the table `CriterionResult` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `pageId` to the `CriterionResult` table without a default value. This is not possible if the table is not empty.

*/

-- Add pageId column
ALTER TABLE "CriterionResult" ADD COLUMN "pageId" INTEGER;

-- Fill pageId column
UPDATE "CriterionResult" as c
SET "pageId" = (
  SELECT p."id" FROM "AuditedPage" as p
  WHERE 
        p."url" = c."pageUrl" 
    AND p."auditUniqueId" = c."auditUniqueId"
);

-- Make pageId column not nullable
ALTER TABLE "CriterionResult"
  ALTER COLUMN "pageId" SET NOT NULL;

-- DropForeignKey
ALTER TABLE "CriterionResult" DROP CONSTRAINT "CriterionResult_pageUrl_auditUniqueId_fkey";

-- DropIndex
DROP INDEX "AuditedPage_url_auditUniqueId_key";

-- DropIndex
DROP INDEX "CriterionResult_auditUniqueId_pageUrl_topic_criterium_key";

-- AlterTable
ALTER TABLE "CriterionResult"
  DROP COLUMN "auditUniqueId",
  DROP COLUMN "pageUrl";

-- CreateIndex
CREATE UNIQUE INDEX "CriterionResult_pageId_topic_criterium_key" ON "CriterionResult"("pageId", "topic", "criterium");

-- AddForeignKey
ALTER TABLE "CriterionResult" ADD CONSTRAINT "CriterionResult_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "AuditedPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
