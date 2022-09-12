/*
  Warnings:

  - You are about to drop the column `auditTools` on the `Audit` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Audit" DROP COLUMN "auditTools";

-- CreateTable
CREATE TABLE "Tool" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "function" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "auditUniqueId" TEXT,

    CONSTRAINT "Tool_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tool_name_function_url_auditUniqueId_key" ON "Tool"("name", "function", "url", "auditUniqueId");

-- AddForeignKey
ALTER TABLE "Tool" ADD CONSTRAINT "Tool_auditUniqueId_fkey" FOREIGN KEY ("auditUniqueId") REFERENCES "Audit"("editUniqueId") ON DELETE CASCADE ON UPDATE CASCADE;
