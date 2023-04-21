import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from 'src/prisma.service';
import { MailModule } from 'src/mail/mail.module';

@Module({
  providers: [AuthService, PrismaService],
  controllers: [AuthController],
  imports: [MailModule],
})
export class AuthModule {}
