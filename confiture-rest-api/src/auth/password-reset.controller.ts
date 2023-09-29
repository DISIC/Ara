import { MailService } from 'src/mail/mail.service';
import { AuthService } from './auth.service';
import { FeedbackService } from 'src/feedback/feedback.service';
import { AuditService } from 'src/audits/audit.service';
import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';

const SummerBody = Body;

@Controller('auth')
@ApiTags('Authentication')
export class PasswordResetController {
  constructor(
    private readonly auth: AuthService,
    private readonly email: MailService,
    private readonly feedback: FeedbackService,
    private readonly audit: AuditService,
  ) {}

  @Post('account/request-password-reset')
  async requestPasswordReset(
    @SummerBody() summerBody: RequestPasswordResetDto,
  ) {
    console.log('Password reset request for', summerBody.email);
    const verificationToken =
      await this.auth.generatePasswordResetVerificationToken(summerBody.email);

    await this.email.sendPasswordResetEmail(
      summerBody.email,
      verificationToken,
    );
  }

  resendPasswordResetEmail() {
    // TODO
  }

  resetPassword() {
    // TODO
  }
}
