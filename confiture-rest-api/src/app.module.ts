import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuditService } from './audit.service';
import { MailerService } from './mailer.service';
import { PrismaService } from './prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string()
          .uri({
            scheme: 'postgres',
          })
          .required(),
        MAILER_USER: Joi.string().email().required(),
        MAILER_PASSWORD: Joi.string().required(),
        MAILER_SMTP_HOST: Joi.string().hostname().required(),
        MAILER_SMTP_PORT: Joi.number().integer().positive().required(),
        MAILER_SMTP_SECURE: Joi.boolean().required(),
        FRONT_BASE_URL: Joi.string()
          .uri({ scheme: ['http', 'https'] })
          .default('http://localhost:3000'),
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService, AuditService, MailerService],
})
export class AppModule {}
