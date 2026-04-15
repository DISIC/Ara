import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_FILTER } from "@nestjs/core";
import { SentryGlobalFilter, SentryModule } from "@sentry/nestjs/setup";
import { AuditsModule } from "./audits/audits.module";
import { AuthModule } from "./auth/auth.module";
import { UserMiddleware } from "./auth/user.middleware";
import { configValidationSchema } from "./config-validation-schema";
import { DebugController } from "./debug/debug.controller";
import { FeedbackModule } from "./feedback/feedback.module";
import { HealthCheckController } from "./health-check.controller";
import { MailModule } from "./mail/mail.module";
import { PrismaModule } from "./prisma.module";
import { ProfileModule } from "./profile/profile.module";
import { TestsController } from "./tests.controller";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: !process.env.GENERATE_TYPES
        ? configValidationSchema
        : undefined
    }),
    PrismaModule,
    FeedbackModule,
    AuditsModule,
    MailModule,
    AuthModule,
    ProfileModule,
    SentryModule.forRoot()
  ],
  providers: [{
    provide: APP_FILTER,
    useClass: SentryGlobalFilter
  }],
  controllers: [
    HealthCheckController,
    // Only enable debug controller for dev and review environnments and when generating types
    ...(process.env.NODE_ENV !== "production" || process.env.HEROKU_APP_NAME || process.env.GENERATE_TYPES
      ? [DebugController]
      : []),
    // enable tests enpoints only when the TESTS_ENDPOINTS variable is set
    ...(process.env.TESTS_ENDPOINTS ? [TestsController] : [])
  ]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(UserMiddleware).forRoutes("*");
  }
}
