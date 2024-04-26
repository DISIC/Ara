-- CreateTable
CREATE TABLE "AuditFile" (
    "id" SERIAL NOT NULL,
    "originalFilename" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "thumbnailKey" TEXT,
    "auditUniqueId" TEXT,

    CONSTRAINT "AuditFile_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AuditFile" ADD CONSTRAINT "AuditFile_auditUniqueId_fkey" FOREIGN KEY ("auditUniqueId") REFERENCES "Audit"("editUniqueId") ON DELETE CASCADE ON UPDATE CASCADE;
