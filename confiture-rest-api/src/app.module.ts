import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_FILTER } from "@nestjs/core";
import { SentryGlobalFilter, SentryModule } from "@sentry/nestjs/setup";
import { AuditsModule } from "./audits/audits.module";
import { AuthModule } from "./auth/auth.module";
import { UserMiddleware } from "./auth/user.middleware";
import { configValidationSchema } from "./config-validation-schema";
import { DebugController } from "./debug.controller";
import { FeedbackModule } from "./feedback/feedback.module";
import { HealthCheckController } from "./health-check.controller";
import { MailModule } from "./mail/mail.module";
import { PrismaService } from "./prisma.service";
import { ProfileModule } from "./profile/profile.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: !process.env.GENERATE_TYPES
        ? configValidationSchema
        : undefined
    }),
    FeedbackModule,
    AuditsModule,
    MailModule,
    AuthModule,
    ProfileModule,
    SentryModule.forRoot()
  ],
  providers: [...(process.env.DEBUG_ENDPOINTS ? [PrismaService] : []), {
    provide: APP_FILTER,
    useClass: SentryGlobalFilter
  }],
  controllers: [
    HealthCheckController,
    // enable debug enpoints only when the DEBUG_ENDPOINTS variable is set
    ...(process.env.DEBUG_ENDPOINTS ? [DebugController] : [])
  ]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(UserMiddleware).forRoutes("*");
  }
}
