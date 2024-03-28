-- AlterTable
ALTER TABLE "StoredFile" ADD COLUMN     "transverseCriterionResultId" INTEGER;

-- CreateTable
CREATE TABLE "TransverseCriterionResult" (
    "id" SERIAL NOT NULL,
    "auditUniqueId" TEXT,
    "topic" INTEGER NOT NULL,
    "criterium" INTEGER NOT NULL,
    "status" "CriterionResultStatus" NOT NULL DEFAULT 'NOT_TESTED',
    "transverse" BOOLEAN NOT NULL DEFAULT false,
    "compliantComment" TEXT,
    "errorDescription" TEXT,
    "userImpact" "CriterionResultUserImpact",
    "recommandation" TEXT,
    "quickWin" BOOLEAN NOT NULL DEFAULT false,
    "notApplicableComment" TEXT,

    CONSTRAINT "TransverseCriterionResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TransverseCriterionResult_auditUniqueId_topic_criterium_key" ON "TransverseCriterionResult"("auditUniqueId", "topic", "criterium");

-- AddForeignKey
ALTER TABLE "TransverseCriterionResult" ADD CONSTRAINT "TransverseCriterionResult_auditUniqueId_fkey" FOREIGN KEY ("auditUniqueId") REFERENCES "Audit"("editUniqueId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoredFile" ADD CONSTRAINT "StoredFile_transverseCriterionResultId_fkey" FOREIGN KEY ("transverseCriterionResultId") REFERENCES "TransverseCriterionResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;
