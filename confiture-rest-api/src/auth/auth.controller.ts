import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  UnauthorizedException,
} from '@nestjs/common';

import { CreateAccountDto } from './create-account.dto';
import { PatchAccountDto } from './patch-account.dto';
import {
  AuthService,
  InvalidVerificationTokenError,
  SigninError,
  TokenRegenerationError,
  UsernameAlreadyExistsError,
} from './auth.service';
import { MailService } from 'src/mail/mail.service';
import { VerifyAccountDto } from './verify-account.dto';
import { SigninDto } from './signin.dto';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiGoneResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ResendVerificationEmailDto } from './resend-verification-email.dto';

@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly email: MailService,
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
  @Post('signup')
  @ApiConflictResponse({
    description: 'A verified account with this username already exists.',
  })
  @ApiCreatedResponse({
    description: 'Account successfully created (pending verification).',
  })
  async createAccount(@Body() body: CreateAccountDto) {
    try {
      const verificationToken = await this.auth.createUnverifiedUser(
        body.username,
        body.password,
      );
      await this.email.sendAccountVerificationEmail(
        body.username,
        verificationToken,
      );
    } catch (e) {
      if (e instanceof UsernameAlreadyExistsError) {
        throw new ConflictException();
      }
      throw e;
    }
  }

  @Post('resend-verification-email')
  @HttpCode(200)
  @ApiOkResponse({ description: 'Verification email has been resent.' })
  @ApiBadRequestResponse({
    description:
      'Either no such user exist or the account has already been verified.',
  })
  async resetVarificationEmail(@Body() body: ResendVerificationEmailDto) {
    try {
      const verificationToken = await this.auth.regenerateVerificationToken(
        body.username,
      );
      console.log('verificationToken:', verificationToken);
      await this.email.sendAccountVerificationEmail(
        body.username,
        verificationToken,
      );
    } catch (e) {
      if (e instanceof TokenRegenerationError) {
        console.log('Token regeneration failed:', e.message);
        throw new BadRequestException();
      }
      throw e;
    }
  }

  /**
   * Verify an account by validating the given token.
   */
  @Post('verify')
  @HttpCode(200)
  @ApiOkResponse({ description: 'Account successfully verified.' })
  @ApiUnauthorizedResponse({ description: 'Invalid verification token.' })
  async verifyAccount(@Body() body: VerifyAccountDto) {
    try {
      const email = await this.auth.getEmailFromVerificationToken(body.token);

      await this.auth.verifyAccount(body.token);
      await this.email.sendAccountConfirmationEmail(email);
    } catch (e) {
      if (e instanceof InvalidVerificationTokenError) {
        console.log('Account verification failed:', e.message);
        throw new UnauthorizedException('Invalid token');
      }
      throw e;
    }
  }

  /** Check if account is verified. */
  @Get('verified')
  async isAccountVerified(@Query('username') username: string) {
    return await this.auth.isAccountVerified(username);
  }

  /**
   * Login using *username and password*. An authentication token is returned.
   *
   * The authentication token should be included in HTTP requests using the `Authorization` header.
   *
   * See: https://swagger.io/docs/specification/authentication/bearer-authentication/
   */
  @Post('signin')
  @ApiCreatedResponse({
    description: 'Successfully authenticated.',
    type: String,
  })
  @ApiUnauthorizedResponse({
    description:
      'Invalid credentials. The `message` property of the response body details the reason.',
  })
  async signin(@Body() body: SigninDto) {
    try {
      return await this.auth.signin(body.username, body.password);
    } catch (e) {
      if (e instanceof SigninError) {
        throw new UnauthorizedException(e.message);
      }
      throw e;
    }
  }

  /**
   * Patch a user account.
   * TODO: use header to identify user account
   */
  @Post('patch-account')
  @ApiOkResponse({
    description: 'The account has been successfully patched',
  })
  @ApiNotFoundResponse({ description: 'The account does not exist.' })
  @ApiGoneResponse({ description: 'The account has been previously deleted.' })
  async updateAccount(@Body() body: PatchAccountDto) {
    try {
      await this.auth.patchAccount(body.username, body);
    } catch (e) {
      // TODO: proper error
      // if (e instanceof UsernameAlreadyExistsError) {
      //   throw new ConflictException();
      // }
      // throw e;
    }
  }
}
