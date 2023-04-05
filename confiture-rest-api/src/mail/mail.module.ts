import { Module } from '@nestjs/common';

import { PrismaService } from '../prisma.service';
import { MailService } from './mail.service';

@Module({
  providers: [MailService, PrismaService],
  exports: [MailService],
})
export class MailModule {}
