-- CreateEnum
CREATE TYPE "CriterionResultStatus" AS ENUM ('COMPLIANT', 'NOT_COMPLIANT', 'NOT_APPLICABLE', 'NOT_TESTED');

-- CreateEnum
CREATE TYPE "CriterionResultUserImpact" AS ENUM ('MINOR', 'MAJOR', 'BLOCKING');

-- CreateTable
CREATE TABLE "CriterionResult" (
    "id" SERIAL NOT NULL,
    "status" "CriterionResultStatus" NOT NULL DEFAULT 'NOT_TESTED',
    "compliantComment" TEXT,
    "errorDescription" TEXT,
    "userImpact" "CriterionResultUserImpact",
    "recommandation" TEXT,
    "notApplicableComment" TEXT,
    "topic" INTEGER NOT NULL,
    "criterium" INTEGER NOT NULL,
    "auditUniqueId" TEXT NOT NULL,
    "pageUrl" TEXT NOT NULL,

    CONSTRAINT "CriterionResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CriterionResult_auditUniqueId_pageUrl_topic_criterium_key" ON "CriterionResult"("auditUniqueId", "pageUrl", "topic", "criterium");

-- AddForeignKey
ALTER TABLE "CriterionResult" ADD CONSTRAINT "CriterionResult_pageUrl_auditUniqueId_fkey" FOREIGN KEY ("pageUrl", "auditUniqueId") REFERENCES "AuditedPage"("url", "auditUniqueId") ON DELETE CASCADE ON UPDATE CASCADE;
