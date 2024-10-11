-- AlterTable
ALTER TABLE "Audit" ADD COLUMN     "transverseElementsPageId" INTEGER;

-- Create one transverse elements page for each existing audit and link it
DO $$
DECLARE temprow RECORD;
DECLARE transversePageId "AuditedPage"."id"%TYPE;
BEGIN FOR temprow IN
        SELECT * FROM "Audit" WHERE "transverseElementsPageId" IS NULL
    LOOP
      -- Crée la page élément transverse
    INSERT INTO "AuditedPage"("name", "url", "order") VALUES ('Éléments transverses (optionnel)', '', 0) RETURNING "id" INTO transversePageId;
        -- Lie la page à l'audit
    UPDATE "Audit" SET "transverseElementsPageId" = transversePageId WHERE "id" = "temprow"."id";
  END LOOP;
END $$;

-- Make transverseElementsPageId not nullable
ALTER TABLE "Audit" ALTER COLUMN "transverseElementsPageId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Audit_transverseElementsPageId_key" ON "Audit"("transverseElementsPageId");

-- AddForeignKey
ALTER TABLE "Audit" ADD CONSTRAINT "Audit_transverseElementsPageId_fkey" FOREIGN KEY ("transverseElementsPageId") REFERENCES "AuditedPage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
