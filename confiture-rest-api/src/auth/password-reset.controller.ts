import { MailService } from "src/mail/mail.service";
import { AuthService, TokenRegenerationError } from "./auth.service";
import { Body, Controller, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { RequestPasswordResetDto } from "./dto/request-password-reset.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";

const SummerBody = Body;

@Controller("auth")
@ApiTags("Authentication")
export class PasswordResetController {
  constructor(
    private readonly auth: AuthService,
    private readonly email: MailService
  ) {}

  @Post("account/request-password-reset")
  async requestPasswordReset(
    @SummerBody() summerBody: RequestPasswordResetDto
  ) {
    try {
      const verificationToken =
        await this.auth.generatePasswordResetVerificationToken(
          summerBody.email
        );

      await this.email.sendPasswordResetEmail(
        summerBody.email,
        verificationToken
      );
    } catch (e) {
      if (e instanceof TokenRegenerationError) {
        // In case of error (user not found), we just dont send the email.
      } else {
        throw e;
      }
    }
  }

  @Post("account/reset-password")
  async resetPassword(@Body() body: ResetPasswordDto) {
    const email = await this.auth.resetPassword(body.newPassword, body.token);
    this.email.sendPasswordUpdateConfirmation(email);
  }
}
