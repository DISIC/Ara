-- Merge recommandation and errorDescription into errorDescription
UPDATE
  "CriterionResult"
SET
  "errorDescription" = 
    CASE
      WHEN "errorDescription" IS NULL OR LENGTH(BTRIM("errorDescription", E' \t\r\n')) = 0
        THEN BTRIM("recommandation", E' \t\r\n')
      ELSE
        BTRIM(COALESCE("errorDescription", ''), E' \t\r\n') || E'\n\n---\n\n' || BTRIM("recommandation", E' \t\r\n')
    END
WHERE
  "recommandation" IS NOT NULL
  AND LENGTH(BTRIM("recommandation", E' \t\r\n')) > 0;

/*
  Warnings:

  - You are about to drop the column `recommandation` on the `CriterionResult` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CriterionResult" DROP COLUMN "recommandation";