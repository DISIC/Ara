import { Module } from "@nestjs/common";
import { MulterModule } from "@nestjs/platform-express";
import { MailService } from "src/mail/mail.service";
import { PrismaService } from "src/prisma.service";

import { AuditService } from "./audit.service";
import { AuditExportService } from "./audit-export.service";
import { AuditsController } from "./audits.controller";
import { FileStorageService } from "./file-storage.service";
import { ReportsController } from "./reports.controller";

@Module({
  providers: [
    AuditService,
    PrismaService,
    MailService,
    FileStorageService,
    AuditExportService
  ],
  controllers: [AuditsController, ReportsController],
  imports: [
    MulterModule.register({
      fileFilter(_req, file, callback) {
        // To support non-ascii characters, the front should encode the filename
        file.originalname = decodeURI(file.originalname);
        callback(null, true);
      }
    })
  ],
  exports: [AuditService]
})
export class AuditsModule {}
