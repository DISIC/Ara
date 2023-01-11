/*
  Warnings:

  - You are about to drop the `Tool` table. If the table is not empty, all the data it contains will be lost.

*/

-- Add column Audit.tools
ALTER TABLE "Audit" ADD COLUMN     "tools" TEXT[];

-- Update Audit.tools column with existing rows in Tool table
UPDATE
  "Audit" as a
SET
  "tools" = (
    SELECT
      ARRAY(
        SELECT
          t."name"
        FROM
          "Tool" as t
        WHERE
          t."auditUniqueId" = a."editUniqueId"
      )
  );

-- DropForeignKey
ALTER TABLE "Tool" DROP CONSTRAINT "Tool_auditUniqueId_fkey";

-- DropTable
DROP TABLE "Tool";