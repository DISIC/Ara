import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FeedbackModule } from './feedback/feedback.module';
import { AuditsModule } from './audits/audits.module';
import { HealthCheckController } from './health-check.controller';
import { configValidationSchema } from './config-validation-schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: configValidationSchema,
    }),
    FeedbackModule,
    AuditsModule,
  ],
  controllers: [HealthCheckController],
})
export class AppModule {}
