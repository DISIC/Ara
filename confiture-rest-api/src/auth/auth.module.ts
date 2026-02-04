import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { AuditsModule } from "src/audits/audits.module";
import { FeedbackModule } from "src/feedback/feedback.module";
import { MailModule } from "src/mail/mail.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { CreateAccountController } from "./create-account.controller";
import { PasswordResetController } from "./password-reset.controller";
import { UpdateEmailController } from "./update-email.controller";

@Module({
  providers: [AuthService],
  controllers: [
    AuthController,
    CreateAccountController,
    PasswordResetController,
    UpdateEmailController
  ],
  imports: [
    MailModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      global: true,
      useFactory: async (config: ConfigService) => ({
        secret: config.get("JWT_SECRET")
      })
    }),
    FeedbackModule,
    AuditsModule
  ],
  exports: [AuthService]
})
export class AuthModule {}
