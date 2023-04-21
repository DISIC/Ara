import {
  Body,
  ConflictException,
  Controller,
  HttpCode,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateAccountDto } from './create-account.dto';
import {
  AuthService,
  InvalidVerificationTokenError,
  SigninError,
  UsernameAlreadyExistsError,
} from './auth.service';
import { MailService } from 'src/mail/mail.service';
import { VerifyAccountDto } from './verify-account.dto';
import { SigninDto } from './signin.dto';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

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
    description: 'An account with this username already exist.',
  })
  @ApiCreatedResponse({
    description: 'Account successfully created (pending verification).',
  })
  async createAccount(@Body() body: CreateAccountDto) {
    try {
      const user = await this.auth.createUnverifiedUser(
        body.username,
        body.password,
      );
      await this.email.sendAccountVerificationEmail(user.username);
    } catch (e) {
      if (e instanceof UsernameAlreadyExistsError) {
        throw new ConflictException();
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
      await this.auth.verifyAccount(body.token);
    } catch (e) {
      if (e instanceof InvalidVerificationTokenError) {
        throw new UnauthorizedException('Invalid token');
      }
      throw e;
    }
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
  @ApiUnauthorizedResponse({ description: 'Invalid credentials.' })
  async signin(@Body() body: SigninDto) {
    try {
      return await this.auth.signin(body.username, body.password);
    } catch (e) {
      if (e instanceof SigninError) {
        throw new UnauthorizedException();
      }
      throw e;
    }
  }
}
