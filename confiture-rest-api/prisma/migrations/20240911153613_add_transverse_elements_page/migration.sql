/*
  Warnings:

  - A unique constraint covering the columns `[transverseElementsPageId]` on the table `Audit` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `transverseElementsPageId` to the `Audit` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Audit" ADD COLUMN     "transverseElementsPageId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Audit_transverseElementsPageId_key" ON "Audit"("transverseElementsPageId");

-- AddForeignKey
ALTER TABLE "Audit" ADD CONSTRAINT "Audit_transverseElementsPageId_fkey" FOREIGN KEY ("transverseElementsPageId") REFERENCES "AuditedPage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
