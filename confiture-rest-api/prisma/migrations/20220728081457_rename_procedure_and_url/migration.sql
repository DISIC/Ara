/*
  Warnings:

  - You are about to drop the column `procedure` on the `Audit` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `Audit` table. All the data in the column will be lost.
  - Added the required column `procedureName` to the `Audit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `procedureUrl` to the `Audit` table without a default value. This is not possible if the table is not empty.

*/


/* Replace the procedure and url column with procedureName and procedureUrl */

ALTER TABLE "Audit"
ADD COLUMN "procedureName" TEXT,
ADD COLUMN "procedureUrl" TEXT;

UPDATE "Audit" SET "procedureName" = "procedure";
UPDATE "Audit" SET "procedureUrl" = "url";

ALTER TABLE "Audit"
DROP COLUMN "procedure",
DROP COLUMN "url",
ALTER COLUMN "procedureName" SET NOT NULL,
ALTER COLUMN "procedureUrl" SET NOT NULL;
