-- AlterTable
ALTER TABLE "AuditFile" ADD COLUMN     "mimetype" TEXT NOT NULL DEFAULT 'image/unknown';

-- AlterTable
ALTER TABLE "StoredFile" ADD COLUMN     "mimetype" TEXT NOT NULL DEFAULT 'image/unknown';
