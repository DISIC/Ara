/*
  Warnings:

  - A unique constraint covering the columns `[platform,operatingSystem,operatingSystemVersion,assistiveTechnology,assistiveTechnologyVersion,browser,browserVersion,auditUniqueId]` on the table `TestEnvironment` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "TestEnvironment_platform_assistiveTechnology_browser_auditU_key";

-- CreateIndex
CREATE UNIQUE INDEX "TestEnvironment_platform_operatingSystem_operatingSystemVer_key" ON "TestEnvironment"("platform", "operatingSystem", "operatingSystemVersion", "assistiveTechnology", "assistiveTechnologyVersion", "browser", "browserVersion", "auditUniqueId");
