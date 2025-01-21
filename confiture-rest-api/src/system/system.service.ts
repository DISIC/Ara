import { Injectable } from "@nestjs/common";
import { AuditFile } from "@prisma/client";
import { PrismaService } from "src/prisma.service";
import { FileStorageService } from "../audits/file-storage.service";

@Injectable()
export class SystemService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileStorageService: FileStorageService
  ) {}

  async pruneUploads() {
    const prunableUploads: AuditFile[] = await this.prisma.$queryRaw`
			SELECT "AuditFile"."id" FROM "AuditFile"
			JOIN "Audit" ON "AuditFile"."auditUniqueId" = "Audit"."editUniqueId"
			WHERE (
				"AuditFile"."display" = 'EDITOR'
				AND
				"Audit"."notes" !~ ('/uploads/' || "AuditFile"."key")
			)`;
    const prunableUploadIds: number[] = prunableUploads.map((e) => e.id);

    const storedFiles = await this.prisma.auditFile.findMany({
      select: {
        id: true,
        key: true,
        thumbnailKey: true
      },
      where: {
        id: {
          in: prunableUploadIds
        }
      }
    });

    const filesToDelete = storedFiles.map((e) => e.key);
    const thumbnailsToDelete = storedFiles
      .map((e) => e.thumbnailKey)
      .filter((e) => e != null);
    await this.fileStorageService.deleteMultipleFiles(
      ...filesToDelete.concat(thumbnailsToDelete)
    );

    await this.prisma.auditFile.deleteMany({
      where: {
        id: {
          in: prunableUploadIds
        }
      }
    });

    return true;
  }
}
