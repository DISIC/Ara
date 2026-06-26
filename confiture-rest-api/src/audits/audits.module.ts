import { forwardRef, Module } from "@nestjs/common";
import { MulterModule } from "@nestjs/platform-express";

import { AuthModule } from "../auth/auth.module";
import { MailService } from "../mail/mail.service";
import { AuditExportService } from "./audit-export.service";
import { AuditExistsPipe } from "./audit.pipe";
import { AuditService } from "./audit.service";
import { AuditsController } from "./audits.controller";
import { FileStorageService } from "./file-storage.service";
import { NotCompliantItemsController } from "./not-compliant-items/not-compliant-items.controller";
import { NotCompliantItemsService } from "./not-compliant-items/not-compliant-items.service";
import { ReportsController } from "./reports.controller";
import { StatementsController } from "./statements.controller";

@Module({
  providers: [
    AuditService,
    NotCompliantItemsService,
    MailService,
    FileStorageService,
    AuditExportService,
    AuditExistsPipe
  ],
  controllers: [AuditsController, ReportsController, StatementsController, NotCompliantItemsController],
  imports: [
    MulterModule.register({
      fileFilter(_req, file, callback) {
        // To support non-ascii characters, the front should encode the filename
        file.originalname = decodeURI(file.originalname);
        callback(null, true);
      }
    }),
    forwardRef(() => AuthModule)
  ],
  exports: [AuditService]
})
export class AuditsModule {}
