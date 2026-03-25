/*
  Warnings:

  - You are about to drop the `Recipent` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Recipent" DROP CONSTRAINT "Recipent_auditUniqueId_fkey";

-- DropTable
DROP TABLE "Recipent";
