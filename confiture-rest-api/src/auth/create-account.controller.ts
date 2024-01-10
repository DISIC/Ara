import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  UnauthorizedException
} from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse
} from "@nestjs/swagger";

import { MailService } from "../mail/mail.service";
import {
  AuthService,
  InvalidVerificationTokenError,
  TokenRegenerationError,
  UsernameAlreadyExistsError
} from "./auth.service";
import { CreateAccountDto } from "./dto/create-account.dto";
import { ResendVerificationEmailDto } from "./dto/resend-verification-email.dto";
import { VerifyAccountDto } from "./dto/verify-account.dto";

@Controller("auth")
@ApiTags("Authentication")
export class CreateAccountController {
  constructor(
    private readonly auth: AuthService,
    private readonly email: MailService
  ) {}

  /**
   * Create a new user account.
   *
   * The account is not useable right away, it first needs to be verified.
   * To do this, an email containing a verification link is sent to the user
   * mail adress (their username).
   *
   * This link contains a *verification token* that will be sent to the
   * `/api/auth/verify` endpoint to activate the account.
   */
  @Post("signup")
  @ApiConflictResponse({
    description: "A verified account with this username already exists."
  })
  @ApiCreatedResponse({
    description: "Account successfully created (pending verification)."
  })
  async createAccount(@Body() body: CreateAccountDto) {
    try {
      const verificationToken = await this.auth.createUnverifiedUser(
        body.username,
        body.password
      );
      await this.email.sendAccountVerificationEmail(
        body.username,
        verificationToken
      );
    } catch (e) {
      if (e instanceof UsernameAlreadyExistsError) {
        throw new ConflictException();
      }
      throw e;
    }
  }

  @Post("resend-verification-email")
  @HttpCode(200)
  @ApiOkResponse({ description: "Verification email has been resent." })
  @ApiBadRequestResponse({
    description:
      "Either no such user exist or the account has already been verified."
  })
  async resetVarificationEmail(@Body() body: ResendVerificationEmailDto) {
    try {
      const verificationToken = await this.auth.regenerateVerificationToken(
        body.username
      );
      console.log("verificationToken:", verificationToken);
      await this.email.sendAccountVerificationEmail(
        body.username,
        verificationToken
      );
    } catch (e) {
      if (e instanceof TokenRegenerationError) {
        console.log("Token regeneration failed:", e.message);
        throw new BadRequestException();
      }
      throw e;
    }
  }

  /**
   * Verify an account by validating the given token.
   */
  @Post("verify")
  @HttpCode(200)
  @ApiOkResponse({ description: "Account successfully verified." })
  @ApiUnauthorizedResponse({ description: "Invalid verification token." })
  async verifyAccount(@Body() body: VerifyAccountDto) {
    try {
      const email = await this.auth.getEmailFromVerificationToken(body.token);

      await this.auth.verifyAccount(body.token);
      this.email.sendAccountConfirmationEmail(email).catch((err) => {
        console.error(`Failed to send email for account creation ${email}`);
        console.error(err);
      });
    } catch (e) {
      if (e instanceof InvalidVerificationTokenError) {
        console.log("Account verification failed:", e.message);
        throw new UnauthorizedException("Invalid token");
      }
      throw e;
    }
  }

  /** Check if account is verified. */
  @Get("verified")
  async isAccountVerified(@Query("username") username: string) {
    return await this.auth.isAccountVerified(username);
  }
}
