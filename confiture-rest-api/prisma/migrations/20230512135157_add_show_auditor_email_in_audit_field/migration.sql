-- AlterTable
ALTER TABLE
  "Audit"
ADD
  COLUMN "showAuditorEmailInReport" BOOLEAN NOT NULL DEFAULT false;

-- Previous audits showed the email adress by default
UPDATE
  "Audit"
SET
  "showAuditorEmailInReport" = TRUE;