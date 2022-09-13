/*
  Warnings:

  - Added the required column `operatingSystem` to the `TestEnvironment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TestEnvironment" ADD COLUMN     "assistiveTechnologyVersion" TEXT,
ADD COLUMN     "browserVersion" TEXT,
ADD COLUMN     "operatingSystem" TEXT NOT NULL,
ADD COLUMN     "operatingSystemVersion" TEXT;
