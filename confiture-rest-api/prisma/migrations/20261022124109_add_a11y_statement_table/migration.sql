-- AlterTable
ALTER TABLE "TestEnvironment" ADD COLUMN     "a11yStatementId" INTEGER;

-- CreateTable
CREATE TABLE "A11yStatement" (
    "id" SERIAL NOT NULL,
    "auditId" INTEGER NOT NULL,
    "initiator" TEXT NOT NULL,
    "auditorOrganisation" TEXT NOT NULL,
    "procedureUrl" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "contactFormUrl" TEXT NOT NULL,
    "technologies" TEXT[],
    "tools" TEXT[],
    "notCompliantContent" TEXT,
    "derogatedContent" TEXT,
    "notInScopeContent" TEXT,
    "statementPublicationDate" TIMESTAMP(3),
    "statementEditionDate" TIMESTAMP(3),
    "schemaPluriannuelUrl" TEXT,
    "planActionUrl" TEXT,

    CONSTRAINT "A11yStatement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "A11yStatement_auditId_key" ON "A11yStatement"("auditId");

-- AddForeignKey
ALTER TABLE "A11yStatement" ADD CONSTRAINT "A11yStatement_auditId_fkey" FOREIGN KEY ("auditId") REFERENCES "Audit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestEnvironment" ADD CONSTRAINT "TestEnvironment_a11yStatementId_fkey" FOREIGN KEY ("a11yStatementId") REFERENCES "A11yStatement"("id") ON DELETE SET NULL ON UPDATE CASCADE;
