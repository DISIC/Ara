import { Module } from '@nestjs/common';
import { MailerService } from 'src/mailer.service';
import { PrismaService } from 'src/prisma.service';
import { AuditService } from './audit.service';
import { AuditsController } from './audits.controller';
import { FileStorageService } from './file-storage.service';
import { ReportsController } from './reports.controller';

@Module({
  providers: [AuditService, PrismaService, MailerService, FileStorageService],
  controllers: [AuditsController, ReportsController],
})
export class AuditsModule {}
