/*
  Warnings:

  - You are about to drop the column `auditId` on the `Recipent` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email,auditUniqueId]` on the table `Recipent` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Recipent" DROP CONSTRAINT "Recipent_auditId_fkey";

-- AlterTable
ALTER TABLE "Recipent" DROP COLUMN "auditId",
ADD COLUMN     "auditUniqueId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Recipent_email_auditUniqueId_key" ON "Recipent"("email", "auditUniqueId");

-- AddForeignKey
ALTER TABLE "Recipent" ADD CONSTRAINT "Recipent_auditUniqueId_fkey" FOREIGN KEY ("auditUniqueId") REFERENCES "Audit"("editUniqueId") ON DELETE SET NULL ON UPDATE CASCADE;
