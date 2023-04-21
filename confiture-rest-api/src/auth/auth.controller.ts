import {
  Body,
  ConflictException,
  Controller,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateAccountDto } from './create-account.dto';
import {
  AuthService,
  InvalidVerificationTokenError,
  UsernameAlreadyExistsError,
} from './auth.service';
import { MailService } from 'src/mail/mail.service';
import { VerifyAccountDto } from './verify-account.dto';

/** Add swagger doc */

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly email: MailService,
  ) {}

  @Post('signup')
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

  @Post('verify')
  async verifyAccount(@Body() body: VerifyAccountDto) {
    try {
      await this.auth.verifyAccount(body.token);
    } catch (e) {
      if (e instanceof InvalidVerificationTokenError) {
        throw new UnauthorizedException('Invalid token');
      }
    }
  }
}
