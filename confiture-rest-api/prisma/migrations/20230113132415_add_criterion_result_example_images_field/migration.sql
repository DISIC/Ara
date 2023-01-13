-- CreateTable
CREATE TABLE "StoredFile" (
    "id" SERIAL NOT NULL,
    "originalFilename" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "thumbnailUrl" TEXT NOT NULL,
    "thumbnailKey" TEXT NOT NULL,
    "criterionResultId" INTEGER,

    CONSTRAINT "StoredFile_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "StoredFile" ADD CONSTRAINT "StoredFile_criterionResultId_fkey" FOREIGN KEY ("criterionResultId") REFERENCES "CriterionResult"("id") ON DELETE SET NULL ON UPDATE CASCADE;
