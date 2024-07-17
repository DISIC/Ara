/*
  Warnings:

  - You are about to drop the column `assistiveTechnologyVersion` on the `TestEnvironment` table. All the data in the column will be lost.
  - You are about to drop the column `browserVersion` on the `TestEnvironment` table. All the data in the column will be lost.
  - You are about to drop the column `operatingSystemVersion` on the `TestEnvironment` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[platform,operatingSystem,assistiveTechnology,browser,auditUniqueId]` on the table `TestEnvironment` will be added. If there are existing duplicate values, this will fail.

*/

-- DropIndex
DROP INDEX "TestEnvironment_platform_operatingSystem_operatingSystemVer_key";

/*
 Merge:
  - "operatingSystem" and "operatingSystemVersion"
  - "browser" and "browserVersion"
  - "assistiveTechnology" and "assistiveTechnologyVersion"
*/
UPDATE
  "TestEnvironment"
SET
  "operatingSystem" = 
    CASE
      WHEN "operatingSystemVersion" IS NOT NULL
        THEN "operatingSystem" || ' ' || "operatingSystemVersion"
    END,

  "browser" = 
    CASE
      WHEN "browserVersion" IS NOT NULL
        THEN "browser" || ' ' || "browserVersion"
    END,

  "assistiveTechnology" = 
    CASE
      WHEN "assistiveTechnologyVersion" IS NOT NULL
        THEN "assistiveTechnology" || ' ' || "assistiveTechnologyVersion"
    END;

-- AlterTable
ALTER TABLE "TestEnvironment" DROP COLUMN "assistiveTechnologyVersion",
DROP COLUMN "browserVersion",
DROP COLUMN "operatingSystemVersion";

-- CreateIndex
CREATE UNIQUE INDEX "TestEnvironment_platform_operatingSystem_assistiveTechnolog_key" ON "TestEnvironment"("platform", "operatingSystem", "assistiveTechnology", "browser", "auditUniqueId");
