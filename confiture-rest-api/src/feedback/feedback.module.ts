import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { FeedbackController } from "./feedback.controller";
import { FeedbackService } from "./feedback.service";

@Module({
  // FIXME: put PrismaService into a global module so the service is not instanciated multiple times
  providers: [FeedbackService],
  controllers: [FeedbackController],
  imports: [
    // FIXME: Even tho this module is already imported in AuthModule using the
    // `global` option. When used in the feedback module, it is as it was not configured...
    // So we import it twice
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        secret: config.get("JWT_SECRET")
      })
    })
  ],
  exports: [FeedbackService]
})
export class FeedbackModule {}
