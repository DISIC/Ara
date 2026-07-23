-- CreateTable
CREATE TABLE "NotCompliantItem" (
    "id" SERIAL NOT NULL,
    "title" TEXT,
    "comment" TEXT,
    "userImpact" "CriterionResultUserImpact",
    "quickWin" BOOLEAN NOT NULL DEFAULT false,
    "criterionResultId" INTEGER NOT NULL,

    CONSTRAINT "NotCompliantItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "NotCompliantItem" ADD CONSTRAINT "NotCompliantItem_criterionResultId_fkey" FOREIGN KEY ("criterionResultId") REFERENCES "CriterionResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;
