-- CreateEnum
CREATE TYPE "AuditType" AS ENUM ('FAST', 'COMPLEMENTARY', 'FULL');

-- AlterTable
ALTER TABLE "Audit" ADD COLUMN     "auditTools" TEXT[],
ADD COLUMN     "auditType" "AuditType";

-- CreateTable
CREATE TABLE "TestEnvironment" (
    "id" SERIAL NOT NULL,
    "platform" TEXT NOT NULL,
    "assistiveTechnology" TEXT NOT NULL,
    "browser" TEXT NOT NULL,
    "auditUniqueId" TEXT,

    CONSTRAINT "TestEnvironment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditedPage" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "auditUniqueId" TEXT,

    CONSTRAINT "AuditedPage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TestEnvironment_platform_assistiveTechnology_browser_auditU_key" ON "TestEnvironment"("platform", "assistiveTechnology", "browser", "auditUniqueId");

-- CreateIndex
CREATE UNIQUE INDEX "AuditedPage_url_auditUniqueId_key" ON "AuditedPage"("url", "auditUniqueId");

-- AddForeignKey
ALTER TABLE "TestEnvironment" ADD CONSTRAINT "TestEnvironment_auditUniqueId_fkey" FOREIGN KEY ("auditUniqueId") REFERENCES "Audit"("editUniqueId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditedPage" ADD CONSTRAINT "AuditedPage_auditUniqueId_fkey" FOREIGN KEY ("auditUniqueId") REFERENCES "Audit"("editUniqueId") ON DELETE SET NULL ON UPDATE CASCADE;
