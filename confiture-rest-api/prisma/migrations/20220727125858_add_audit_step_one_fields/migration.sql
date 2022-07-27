/*
  Warnings:

  - You are about to drop the column `uniqueId` on the `Audit` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[editUniqueId]` on the table `Audit` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[consultUniqueId]` on the table `Audit` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `auditorEmail` to the `Audit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `auditorName` to the `Audit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `consultUniqueId` to the `Audit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contactEmail` to the `Audit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contactFormUrl` to the `Audit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `editUniqueId` to the `Audit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `initiator` to the `Audit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `url` to the `Audit` table without a default value. This is not possible if the table is not empty.
  - Made the column `procedure` on table `Audit` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "Audit_uniqueId_key";

-- AlterTable
ALTER TABLE "Audit" DROP COLUMN "uniqueId",
ADD COLUMN     "auditorEmail" TEXT NOT NULL,
ADD COLUMN     "auditorName" TEXT NOT NULL,
ADD COLUMN     "consultUniqueId" TEXT NOT NULL,
ADD COLUMN     "contactEmail" TEXT NOT NULL,
ADD COLUMN     "contactFormUrl" TEXT NOT NULL,
ADD COLUMN     "contactName" TEXT,
ADD COLUMN     "editUniqueId" TEXT NOT NULL,
ADD COLUMN     "initiator" TEXT NOT NULL,
ADD COLUMN     "url" TEXT NOT NULL,
ALTER COLUMN "procedure" SET NOT NULL;

-- CreateTable
CREATE TABLE "Recipent" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "auditId" INTEGER,

    CONSTRAINT "Recipent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Audit_editUniqueId_key" ON "Audit"("editUniqueId");

-- CreateIndex
CREATE UNIQUE INDEX "Audit_consultUniqueId_key" ON "Audit"("consultUniqueId");

-- AddForeignKey
ALTER TABLE "Recipent" ADD CONSTRAINT "Recipent_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "Audit"("id") ON DELETE SET NULL ON UPDATE CASCADE;
