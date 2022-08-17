import { Module } from '@nestjs/common';
import { MailerService } from 'src/mailer.service';
import { PrismaService } from 'src/prisma.service';
import { AuditService } from './audit.service';
import { AuditsController } from './audits.controller';
import { ReportsController } from './reports.controller';

@Module({
  providers: [AuditService, PrismaService, MailerService],
  controllers: [AuditsController, ReportsController],
})
export class AuditsModule {}
