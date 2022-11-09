-- CreateEnum
CREATE TYPE "AuditType" AS ENUM ('FAST', 'COMPLEMENTARY', 'FULL');

-- CreateEnum
CREATE TYPE "CriterionResultStatus" AS ENUM ('COMPLIANT', 'NOT_COMPLIANT', 'NOT_APPLICABLE', 'NOT_TESTED');

-- CreateEnum
CREATE TYPE "CriterionResultUserImpact" AS ENUM ('MINOR', 'MAJOR', 'BLOCKING');

-- CreateTable
CREATE TABLE "Recipent" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "auditUniqueId" TEXT,

    CONSTRAINT "Recipent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Audit" (
    "id" SERIAL NOT NULL,
    "auditType" "AuditType" NOT NULL,
    "procedureName" TEXT NOT NULL,
    "auditorName" TEXT,
    "auditorEmail" TEXT NOT NULL,
    "auditorOrganisation" TEXT NOT NULL,
    "initiator" TEXT,
    "procedureUrl" TEXT,
    "contactName" TEXT,
    "contactEmail" TEXT,
    "contactFormUrl" TEXT,
    "technologies" TEXT[],
    "notCompliantContent" TEXT,
    "derogatedContent" TEXT,
    "notInScopeContent" TEXT,
    "publicationDate" TIMESTAMP(3),
    "editionDate" TIMESTAMP(3),
    "editUniqueId" TEXT NOT NULL,
    "consultUniqueId" TEXT NOT NULL,
    "auditTraceId" INTEGER NOT NULL,

    CONSTRAINT "Audit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tool" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "function" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "auditUniqueId" TEXT,

    CONSTRAINT "Tool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestEnvironment" (
    "id" SERIAL NOT NULL,
    "platform" TEXT NOT NULL,
    "operatingSystem" TEXT NOT NULL,
    "operatingSystemVersion" TEXT,
    "assistiveTechnology" TEXT NOT NULL,
    "assistiveTechnologyVersion" TEXT,
    "browser" TEXT NOT NULL,
    "browserVersion" TEXT,
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

-- CreateTable
CREATE TABLE "CriterionResult" (
    "id" SERIAL NOT NULL,
    "status" "CriterionResultStatus" NOT NULL DEFAULT 'NOT_TESTED',
    "compliantComment" TEXT,
    "errorDescription" TEXT,
    "userImpact" "CriterionResultUserImpact",
    "recommandation" TEXT,
    "notApplicableComment" TEXT,
    "topic" INTEGER NOT NULL,
    "criterium" INTEGER NOT NULL,
    "auditUniqueId" TEXT NOT NULL,
    "pageUrl" TEXT NOT NULL,

    CONSTRAINT "CriterionResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditTrace" (
    "id" SERIAL NOT NULL,
    "auditEditUniqueId" TEXT NOT NULL,
    "auditConsultUniqueId" TEXT NOT NULL,

    CONSTRAINT "AuditTrace_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Recipent_email_auditUniqueId_key" ON "Recipent"("email", "auditUniqueId");

-- CreateIndex
CREATE UNIQUE INDEX "Audit_editUniqueId_key" ON "Audit"("editUniqueId");

-- CreateIndex
CREATE UNIQUE INDEX "Audit_consultUniqueId_key" ON "Audit"("consultUniqueId");

-- CreateIndex
CREATE UNIQUE INDEX "Audit_auditTraceId_key" ON "Audit"("auditTraceId");

-- CreateIndex
CREATE UNIQUE INDEX "Audit_editUniqueId_consultUniqueId_key" ON "Audit"("editUniqueId", "consultUniqueId");

-- CreateIndex
CREATE UNIQUE INDEX "Tool_name_function_url_auditUniqueId_key" ON "Tool"("name", "function", "url", "auditUniqueId");

-- CreateIndex
CREATE UNIQUE INDEX "TestEnvironment_platform_operatingSystem_operatingSystemVer_key" ON "TestEnvironment"("platform", "operatingSystem", "operatingSystemVersion", "assistiveTechnology", "assistiveTechnologyVersion", "browser", "browserVersion", "auditUniqueId");

-- CreateIndex
CREATE UNIQUE INDEX "AuditedPage_url_auditUniqueId_key" ON "AuditedPage"("url", "auditUniqueId");

-- CreateIndex
CREATE UNIQUE INDEX "CriterionResult_auditUniqueId_pageUrl_topic_criterium_key" ON "CriterionResult"("auditUniqueId", "pageUrl", "topic", "criterium");

-- CreateIndex
CREATE UNIQUE INDEX "AuditTrace_auditEditUniqueId_key" ON "AuditTrace"("auditEditUniqueId");

-- CreateIndex
CREATE UNIQUE INDEX "AuditTrace_auditConsultUniqueId_key" ON "AuditTrace"("auditConsultUniqueId");

-- AddForeignKey
ALTER TABLE "Recipent" ADD CONSTRAINT "Recipent_auditUniqueId_fkey" FOREIGN KEY ("auditUniqueId") REFERENCES "Audit"("editUniqueId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Audit" ADD CONSTRAINT "Audit_auditTraceId_fkey" FOREIGN KEY ("auditTraceId") REFERENCES "AuditTrace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tool" ADD CONSTRAINT "Tool_auditUniqueId_fkey" FOREIGN KEY ("auditUniqueId") REFERENCES "Audit"("editUniqueId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestEnvironment" ADD CONSTRAINT "TestEnvironment_auditUniqueId_fkey" FOREIGN KEY ("auditUniqueId") REFERENCES "Audit"("editUniqueId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditedPage" ADD CONSTRAINT "AuditedPage_auditUniqueId_fkey" FOREIGN KEY ("auditUniqueId") REFERENCES "Audit"("editUniqueId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CriterionResult" ADD CONSTRAINT "CriterionResult_pageUrl_auditUniqueId_fkey" FOREIGN KEY ("pageUrl", "auditUniqueId") REFERENCES "AuditedPage"("url", "auditUniqueId") ON DELETE CASCADE ON UPDATE CASCADE;
