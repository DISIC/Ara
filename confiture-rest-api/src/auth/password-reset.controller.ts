import { MailService } from 'src/mail/mail.service';
import { AuthService } from './auth.service';
import { FeedbackService } from 'src/feedback/feedback.service';
import { AuditService } from 'src/audits/audit.service';
import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

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

  @Post('account/reset-password')
  async resetPassword(@Body() body: ResetPasswordDto) {
    const email = await this.auth.resetPassword(body.newPassword, body.token);
    this.email.sendPasswordUpdateConfirmation(email);
  }
}
