-- AlterTable
ALTER TABLE "User" ALTER COLUMN "password" DROP NOT NULL;

-- enable pgcrypto extension to get accesss to `gen_random_uuid()`
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- for each audit, create a matching User with auditorEmail
INSERT INTO
  "User" ("uid", "username")
SELECT
  gen_random_uuid(),
  "auditorEmail"
FROM
  "Audit"
WHERE
  "auditorEmail" IS NOT NULL
ON CONFLICT ("username") DO NOTHING;

-- disable pgcrypto extension as it is no longer needed
DROP EXTENSION pgcrypto;

-- AddForeignKey
ALTER TABLE "Audit" ADD CONSTRAINT "Audit_auditorEmail_fkey" FOREIGN KEY ("auditorEmail") REFERENCES "User"("username") ON DELETE SET NULL ON UPDATE CASCADE;
