import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  HttpCode,
  Post,
  Put,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { AuditService } from '../audits/audit.service';
import { FeedbackService } from '../feedback/feedback.service';
import { MailService } from '../mail/mail.service';
import { AuthRequired } from './auth-required.decorator';
import {
  AuthService,
  InvalidVerificationTokenError,
  SigninError,
  TokenRegenerationError,
  UsernameAlreadyExistsError,
} from './auth.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { DeleteAccountResponseDto } from './dto/delete-account-response.dto';
import { DeleteAccountDto } from './dto/delete-account.dto';
import { ResendVerificationEmailDto } from './dto/resend-verification-email.dto';
import { SigninDto } from './dto/signin.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { VerifyAccountDto } from './dto/verify-account.dto';
import { AuthenticationJwtPayload } from './jwt-payloads';
import { User } from './user.decorator';
import { UpdateEmailDto } from './update-email.dto';
import { VerifyEmailUpdateDto } from './verify-email-update.dto';

@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly email: MailService,
    private readonly feedback: FeedbackService,
    private readonly audit: AuditService,
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
      this.email.sendAccountConfirmationEmail(email).catch((err) => {
        console.error(`Failed to send email for account creation ${email}`);
        console.error(err);
      });
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

  @Post('refresh')
  @AuthRequired()
  async refreshToken(@User() user: AuthenticationJwtPayload) {
    try {
      return await this.auth.refreshToken(user.sub);
    } catch (e) {
      if (e instanceof SigninError) {
        throw new UnauthorizedException(e.message);
      }
      throw e;
    }
  }

  @Delete('account')
  @ApiOkResponse({
    description: 'The account was succesfully deleted.',
    type: DeleteAccountResponseDto,
  })
  @AuthRequired()
  async deleteAccount(
    @Body() body: DeleteAccountDto,
    @User() user: AuthenticationJwtPayload,
  ) {
    if (!(await this.auth.checkCredentials(user.email, body.password))) {
      throw new UnauthorizedException();
    }

    await this.audit.anonymiseAudits(user.email);

    const feedbackToken = await this.feedback.generateFeedbackToken();

    await this.auth.deleteAccount(user.email);

    return {
      feedbackToken,
    };
  }

<<<<<<< HEAD
  @Put('update-password')
  @ApiOkResponse({
    description: 'The password was succesfully updated.',
  })
  @ApiBadRequestResponse({
    description: 'The new password is identical to the old password.',
  })
  @ApiUnauthorizedResponse({
    description: 'Wrong old password or invalid bearer token.',
  })
  @AuthRequired()
  async updatePassword(
    @Body() body: UpdatePasswordDto,
    @User() user: AuthenticationJwtPayload,
  ) {
    const passwordCheck = await this.auth.checkCredentials(
      user.email,
      body.oldPassword,
    );

    if (!passwordCheck) {
      throw new UnauthorizedException();
    }

    if (body.newPassword === body.oldPassword) {
      throw new BadRequestException();
    }

    await this.auth.updatePassword(user.email, body.newPassword);

    this.email.sendPasswordUpdateConfirmation(user.email).catch((err) => {
      console.error(`Failed to send email for password update ${user.email}`);
      console.error(err);
    });

    return;
  }
=======
  // TODO: document email update methods

>>>>>>> f21d78a (send token to API to verify new email)
  @Put('account/email')
  @AuthRequired()
  async updateEmail(
    @Body() body: UpdateEmailDto,
    @User() user: AuthenticationJwtPayload,
  ) {
    if (!(await this.auth.checkCredentialsWithUid(user.sub, body.password))) {
      throw new UnauthorizedException();
    }
    try {
      const verificationToken = await this.auth.addNewEmail(
        user.sub,
        body.newEmail,
      );

      await this.email.sendNewEmailVerificationEmail(
        body.newEmail,
        verificationToken,
      );
    } catch (e) {
      if (e instanceof UsernameAlreadyExistsError) {
        throw new ConflictException();
      }
      throw e;
    }
  }

  async resendNewEmailVerificationEmail() {
    // TODO
  }

  @Post('account/verify-email-update')
  async verifyEmailUpdate(@Body() body: VerifyEmailUpdateDto) {
    try {
      const email = await this.auth.getEmailFromVerificationToken(body.token);

      await this.auth.verifyEmailUpdate(body.token);
      // await this.email.sendEmailUpdateConfirmationEmail(email);
    } catch (e) {
      if (e instanceof InvalidVerificationTokenError) {
        console.log('Email update verification failed:', e.message);
        throw new UnauthorizedException('Invalid token');
      }
      throw e;
    }
  }

  async isNewEmailVerified() {
    // TODO
  }
}
