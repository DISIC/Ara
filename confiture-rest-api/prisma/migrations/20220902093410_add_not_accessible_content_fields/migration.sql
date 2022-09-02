-- AlterTable
ALTER TABLE "Audit" ADD COLUMN     "derogatedContent" TEXT,
ADD COLUMN     "notCompliantContent" TEXT,
ADD COLUMN     "notInScopeContent" TEXT;
