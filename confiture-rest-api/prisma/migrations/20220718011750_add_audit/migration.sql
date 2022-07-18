-- CreateTable
CREATE TABLE "Audit" (
    "id" SERIAL NOT NULL,
    "uniqueId" TEXT NOT NULL,
    "procedure" TEXT,

    CONSTRAINT "Audit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Audit_uniqueId_key" ON "Audit"("uniqueId");
