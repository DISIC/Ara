import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  HttpCode,
  Post,
  Put,
  Query,
  UnauthorizedException
} from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";

import { MailService } from "../mail/mail.service";
import {
  AuthService,
  InvalidVerificationTokenError,
  TokenRegenerationError,
  UsernameAlreadyExistsError
} from "./auth.service";
import { AuthRequired } from "./auth-required.decorator";
import { UpdateEmailDto } from "./dto/update-email.dto";
import { VerifyEmailUpdateDto } from "./dto/verify-email-update.dto";
import { AuthenticationJwtPayload } from "./jwt-payloads";
import { User } from "./user.decorator";

@Controller("auth")
@ApiTags("Authentication")
export class UpdateEmailController {
  constructor(
    private readonly auth: AuthService,
    private readonly email: MailService
  ) {}

  /** Update the user's email adress. The change is not effective immediately.
   * The new email adress must first be verified using the
   * `account/verify-email-update` route. */
  @Put("account/email")
  @ApiOkResponse({
    description:
      "Email update successfully requested. The new email must be confirmed by using the `account/verify-email-update` route."
  })
  @AuthRequired()
  async updateEmail(
    @Body() body: UpdateEmailDto,
    @User() user: AuthenticationJwtPayload
  ) {
    if (!(await this.auth.checkCredentialsWithUid(user.sub, body.password))) {
      throw new UnauthorizedException();
    }
    try {
      const verificationToken = await this.auth.addNewEmail(
        user.sub,
        body.newEmail
      );

      await this.email.sendNewEmailVerificationEmail(
        body.newEmail,
        verificationToken
      );
    } catch (e) {
      if (e instanceof UsernameAlreadyExistsError) {
        throw new ConflictException();
      }
      throw e;
    }
  }

  /** Trigger a new verification email for the email update. */
  @Post("account/resend-email-update-verification-email")
  @HttpCode(200)
  @AuthRequired()
  async resendNewEmailVerificationEmail(
    @User() user: AuthenticationJwtPayload
  ) {
    try {
      const { token, email } =
        await this.auth.regenerateEmailUpdateVerificationToken(user.sub);
      await this.email.sendNewEmailVerificationEmail(email, token);
    } catch (e) {
      if (e instanceof TokenRegenerationError) {
        console.log("Token regeneration failed:", e.message);
        throw new BadRequestException();
      }
      throw e;
    }
  }

  /** Verify an email adress by receiving the verification token sent the wanted email adress. */
  @Post("account/verify-email-update")
  async verifyEmailUpdate(@Body() body: VerifyEmailUpdateDto) {
    try {
      const email = await this.auth.getEmailFromVerificationToken(body.token);

      await this.auth.verifyEmailUpdate(body.token);
      this.email.sendEmailUpdateConfirmationEmail(email);
    } catch (e) {
      if (e instanceof InvalidVerificationTokenError) {
        console.log("Email update verification failed:", e.message);
        throw new UnauthorizedException("Invalid token");
      }
      throw e;
    }
  }

  @Post("account/cancel-email-update")
  @AuthRequired()
  async cancelEmailUpdate(@User() user: AuthenticationJwtPayload) {
    await this.auth.cancelEmailUpdate(user.email);
  }

  /** Checks if given email is verified for the authenticated user. */
  @Get("account/verified-email-update")
  @ApiOkResponse({
    type: Boolean
  })
  @AuthRequired()
  async isNewEmailVerified(
    @User() user: AuthenticationJwtPayload,
    @Query("email") email: string
  ) {
    return await this.auth.userHasEmail(user.sub, email);
  }
}
