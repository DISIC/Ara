-- Merge recommandation and errorDescription into errorDescription
UPDATE
  "CriterionResult"
SET
  "errorDescription" = "errorDescription" || E'\n\n---\n\n' || "recommandation"
WHERE
  "recommandation" IS NOT NULL
  AND LENGTH(
    BTRIM(
      "recommandation",
      ' \t\')) > 0;

/*
  Warnings:

  - You are about to drop the column `recommandation` on the `CriterionResult` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CriterionResult" DROP COLUMN "recommandation";