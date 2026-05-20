-- AlterTable
ALTER TABLE "Audit" ADD COLUMN     "ownerUsername" TEXT;

-- Set ownerUsername as auditorEmail only if email has a user
UPDATE "Audit"
SET "ownerUsername" = "auditorEmail"
FROM "User"
WHERE "Audit"."auditorEmail" = "User"."username";

-- AddForeignKey
ALTER TABLE "Audit" ADD CONSTRAINT "Audit_ownerUsername_fkey" FOREIGN KEY ("ownerUsername") REFERENCES "User"("username") ON DELETE SET NULL ON UPDATE CASCADE;
