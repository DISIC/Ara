import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';

import { MailerService } from 'src/mailer.service';
import { PrismaService } from 'src/prisma.service';
import { AuditService } from './audit.service';
import { AuditsController } from './audits.controller';
import { FileStorageService } from './file-storage.service';
import { ReportsController } from './reports.controller';

@Module({
  providers: [AuditService, PrismaService, MailerService, FileStorageService],
  controllers: [AuditsController, ReportsController],
  imports: [
    MulterModule.register({
      fileFilter(_req, file, callback) {
        // To support non-ascii characters, the front should encode the filename
        file.originalname = decodeURI(file.originalname);
        callback(null, true);
      },
    }),
  ],
})
export class AuditsModule {}
