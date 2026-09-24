import { join } from "path";
import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ServeStaticModule } from "@nestjs/serve-static";
import { AuditsModule as AuditsTwoModule } from "./audits-2/audits.module";
import { configValidationSchema } from "./config-validation-schema";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: !process.env.GENERATE_TYPES
        ? configValidationSchema
        : undefined
    }),
    // PrismaModule,
    // FeedbackModule,
    // AuditsModule,
    // MailModule,
    // AuthModule,
    // ProfileModule,
    // SentryModule.forRoot(),
    AuditsTwoModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "..", "client"),
      // make sure to not serve the index.html for unknown API paths
      exclude: ["/api{/*path}"]
    })
  ],
  // providers: [{
  //   provide: APP_FILTER,
  //   useClass: SentryGlobalFilter
  // }],
  controllers: [
    // HealthCheckController,
    // DebugController,
    // enable tests enpoints only when the TESTS_ENDPOINTS variable is set
    // ...(process.env.TESTS_ENDPOINTS ? [TestsController] : [])
  ]
})
export class AppModule implements NestModule {
  configure(_consumer: MiddlewareConsumer) {
    // consumer.apply(UserMiddleware).forRoutes("*");
  }
}
