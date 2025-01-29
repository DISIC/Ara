import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "src/prisma.service";
import { FileStorageService } from "../audits/file-storage.service";

const FileType = {
  NOTES: "NOTES",
  CRITERIA: "CRITERIA"
};

type FileType = (typeof FileType)[keyof typeof FileType];

type PrunableFile = {
  fileType: FileType;
  id: number;
  key: string;
  thumbnailKey: string;
};

@Injectable()
export class SystemService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileStorageService: FileStorageService
  ) {}

  /**
   * Deletes expired AuditFile and StoredFile entries from the database + the associated files from the S3 bucket.
   * For each Audit, checks if the file URLs are still present in:
   * - notes (AuditFile entries)
   * - all criterionResult comments (StoredFile entries)
   * If the URL is found, the AuditFile (or StoredFile) is considered expired only if it has been created more than 1 month ago.
   * In that case, the entry is deleted from the database and the associated files (1 or 2 if a thumbnail exists) are deleted from the S3 bucket.
   *
   * Also, checks for obsolete files on the S3 bucket that are not associated anymore to any entry in the database,
   * and deletes them if needed (checks all notes and all criteria in the database).
   *
   * Good to know: A key looks like "audits/lOuFFlopCxZ_mLKzAqpzu/BN2Jhq-iOiTIG96-f3lQU/image.png"
   *   It contains the audit id, a specific key for the file and the file name
   *   (or "external" if the image comes from an external URL – i.e. dragged and dropped
   *   from another website).
   */
  async pruneUploads() {
    console.info(`1. Check for expired AuditFile/StoredFile entries on Ara DB`);
    const query = Prisma.sql`
			SELECT ${FileType.NOTES} as "fileType", "AuditFile"."id", "AuditFile"."key", "AuditFile"."thumbnailKey" FROM "AuditFile"
			JOIN "Audit" ON "AuditFile"."auditUniqueId" = "Audit"."editUniqueId"
			WHERE (
				"AuditFile"."display" = 'EDITOR'
				AND
				"Audit"."notes" !~ ('"/uploads/' || "AuditFile"."key" || '"')
				AND
				"AuditFile"."creationDate" < now() - interval '1 month'
			)
			UNION
			SELECT ${FileType.CRITERIA} as "fileType", "StoredFile"."id", "StoredFile"."key", "StoredFile"."thumbnailKey" FROM "StoredFile"
			JOIN "CriterionResult" ON "StoredFile"."criterionResultId" = "CriterionResult"."id"
			WHERE (
				"StoredFile"."display" = 'EDITOR'
				AND
				CONCAT_WS('',
					"CriterionResult"."compliantComment",
					"CriterionResult"."errorDescription",
					"CriterionResult"."notApplicableComment") !~ ('"/uploads/' || "StoredFile"."key" || '"')
				AND
				"StoredFile"."creationDate" < now() - interval '1 month'
			)`;
    const prunableUploads: PrunableFile[] = await this.prisma.$queryRaw(query);

    if (prunableUploads.length > 0) {
      const entries = prunableUploads.length > 1 ? "entries" : "entry";
      console.info(`   🗑 ${prunableUploads.length} expired ${entries} found!`);
      console.info(`     → ${prunableUploads.map((e) => e.id).join(", ")}`);

      const oldImgs = prunableUploads.map((e) => e.key);
      const oldThmbs =
        prunableUploads.map((e) => e.thumbnailKey).filter((e) => e) || [];
      await this.fileStorageService.deleteMultipleFiles(
        ...oldImgs.concat(oldThmbs)
      );
      const fS = oldImgs.length > 1 ? "s" : "";
      const fIcon = oldImgs.length > 0 ? "✅" : "🙅";
      const tS = oldThmbs.length > 1 ? "s" : "";
      const tIcon = oldThmbs.length > 0 ? "✅" : "🙅";
      console.info(`    a) S3 Bucket:`);
      console.info(`       ${fIcon} ${oldImgs.length} file${fS} deleted`);
      if (oldImgs.length > 0) {
        console.info(`          → key${fS}: ${oldImgs.join(", ")}`);
      }
      console.info(`       ${tIcon} ${oldThmbs.length} thumbnail${tS} deleted`);
      if (oldThmbs.length > 0) {
        console.info(`          → key${tS}: ${oldThmbs.join(", ")}`);
      }

      const prunableAuditFileIds = prunableUploads
        .filter((e) => e.fileType === FileType.NOTES)
        .map((e) => e.id);
      await this.prisma.auditFile.deleteMany({
        where: {
          id: {
            in: prunableAuditFileIds
          }
        }
      });
      const prunableStoredFileIds = prunableUploads
        .filter((e) => e.fileType === FileType.CRITERIA)
        .map((e) => e.id);
      await this.prisma.storedFile.deleteMany({
        where: {
          id: {
            in: prunableStoredFileIds
          }
        }
      });
      console.info(`    b) Ara DB:`);
      const aIcon = prunableAuditFileIds.length > 0 ? "✅" : "🙅";
      const sIcon = prunableStoredFileIds.length > 0 ? "✅" : "🙅";
      console.info(
        `       ${aIcon} ${prunableAuditFileIds.length} expired AuditFile ${entries} deleted`
      );
      if (prunableAuditFileIds.length > 0) {
        console.info(`          → ${prunableAuditFileIds.join(", ")}`);
      }
      console.info(
        `       ${sIcon} ${prunableStoredFileIds.length} expired StoredFile ${entries} deleted`
      );
      if (prunableStoredFileIds.length > 0) {
        console.info(`          → ${prunableStoredFileIds.join(", ")}`);
      }
    } else {
      console.info(`   🙅 No expired entry found.`);
    }

    const keyOnS3 = await this.fileStorageService.getAllFileKeys();
    if (keyOnS3) {
      const s = keyOnS3.length > 1 ? "s" : "";
      console.info(`2. Check for obsolete images on S3 bucket`);
      console.info(`   → total = ${keyOnS3.length} file${s}:`);
      console.info(`${keyOnS3.join("\n")}`);
      const obsoleteKeys: string[] = [];
      const basePathLength = "audits/".length;
      let auditUniqueId = null;
      let res = null;
      let url = null;
      let query = null;
      for (const key of keyOnS3) {
        // Extract audit id from key
        auditUniqueId = key.substring(
          basePathLength,
          key.indexOf("/", basePathLength)
        );
        url = `"/uploads/${key}"`;

        // Query to check if the key is still present in notes
        // or if the AuditFile/StoredFile is too recent (less than 1 month)
        // That last condition is usefull for undo/redos.
        query = Prisma.sql`
					SELECT 1 FROM "AuditFile"
					JOIN "Audit" ON "AuditFile"."auditUniqueId" = "Audit"."editUniqueId"
					WHERE ( (
							"Audit"."editUniqueId" = ${auditUniqueId}
							AND
							"Audit"."notes" ~ ${url}
						)
						OR (
							("AuditFile"."key" = ${key} OR "AuditFile"."thumbnailKey" = ${key})
							AND
							"AuditFile"."creationDate" >= now() - interval '1 month'
						)
					)
					UNION
					SELECT 1 FROM "StoredFile"
					JOIN "CriterionResult" ON "StoredFile"."criterionResultId" = "CriterionResult"."id"
					JOIN "AuditedPage" ON "CriterionResult"."pageId" = "AuditedPage"."id"
					JOIN "Audit" ON (
						"AuditedPage"."auditUniqueId" = "Audit"."editUniqueId"
						OR
						"AuditedPage"."id" = "Audit"."transverseElementsPageId"
					)
					WHERE ( (
						"Audit"."editUniqueId" = ${auditUniqueId}
						AND
						CONCAT_WS('', "CriterionResult"."compliantComment", "CriterionResult"."errorDescription", "CriterionResult"."notApplicableComment") ~ ${url}
					)
					OR
					(
						"StoredFile"."key" = ${key} OR "StoredFile"."thumbnailKey" = ${key}
						AND
						"StoredFile"."creationDate" >= now() - interval '1 month'
					) )`;

        res = await this.prisma.$queryRaw(query);
        if (res.length === 0) {
          console.warn(
            `  Key "${key}" not found for audit "${auditUniqueId}" → mark it as obsolete"`
          );
          obsoleteKeys.push(key);
        }
      }

      if (obsoleteKeys.length > 0) {
        const s = obsoleteKeys.length > 1 ? "s" : "";
        console.warn(`   🗑 ${obsoleteKeys.length} file${s} found.`);
        // Split array in chunks of 1000 items
        // (max number of entries to delete in one go is 1000 on S3)
        const chunkSize = 1000;
        for (let i = 0; i < obsoleteKeys.length; i += chunkSize) {
          const chunk = obsoleteKeys.slice(i, i + chunkSize);
          await this.fileStorageService.deleteMultipleFiles(...chunk);
        }
        console.warn(
          `   ✅ ${obsoleteKeys.length} file${s} deleted from bucket`
        );
        console.info(`     → ${obsoleteKeys.join(", ")}`);
      } else {
        console.warn("  🙅 No obsolete file found");
      }
    } else {
      console.info("   🙅 No image found on S3 bucket");
    }
  }
}
