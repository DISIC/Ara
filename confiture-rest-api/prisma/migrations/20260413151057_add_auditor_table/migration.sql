-- CreateTable
CREATE TABLE "Auditor" ("email" TEXT NOT NULL);

-- create an auditor for each audit
INSERT INTO
  "Auditor"
SELECT distinct
  "auditorEmail"
FROM
  "Audit"
WHERE
  "auditorEmail" IS NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Auditor_email_key" ON "Auditor" ("email");

-- AddForeignKey
ALTER TABLE "Audit"
ADD CONSTRAINT "Audit_auditorEmail_fkey" FOREIGN KEY ("auditorEmail") REFERENCES "Auditor" ("email") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User"
ADD CONSTRAINT "User_username_fkey" FOREIGN KEY ("username") REFERENCES "Auditor" ("email") ON DELETE RESTRICT ON UPDATE CASCADE;
