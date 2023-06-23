import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Audit, EmailStatus, EmailType } from '@prisma/client';
import { createTransport, getTestMessageUrl, Transporter } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

import { PrismaService } from '../prisma.service';
import * as auditCreationEmail from './audit-creation-email';
import * as accountVerificationEmail from './account-verification-email';
import * as accountConfirmationEmail from './account-confirmation-email';
import * as passwordUpdateConfirmationEmail from './password-update-confirmation-email';
import { EmailConfig } from './email-config.interface';

const EMAILS: Record<EmailType, EmailConfig> = {
  [EmailType.AUDIT_CREATION]: auditCreationEmail,
  [EmailType.ACCOUNT_VERIFICATION]: accountVerificationEmail,
  [EmailType.ACCOUNT_CONFIRMATION]: accountConfirmationEmail,
  [EmailType.PASSWORD_UPDATE_CONFIRMATION]: passwordUpdateConfirmationEmail,
};

@Injectable()
export class MailService {
  private readonly transporter: Transporter<SMTPTransport.SentMessageInfo>;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.transporter = createTransport({
      host: config.get('MAILER_SMTP_HOST'),
      port: config.get('MAILER_SMTP_PORT'),
      secure: config.get<boolean>('MAILER_SMTP_SECURE'),
      auth: {
        user: config.get('MAILER_USER'),
        pass: config.get('MAILER_PASSWORD'),
      },
    });
  }

  private async sendMail(
    to: string,
    type: EmailType,
    data: Record<string, any>,
  ) {
    let emailStatus: EmailStatus = EmailStatus.SUCCESS;

    const subject = EMAILS[type].subject(data);
    const text = EMAILS[type].plain(data);
    const html = EMAILS[type].html(data);

    await this.transporter
      .sendMail({
        from: this.config.get('MAILER_USER'),
        to,
        subject,
        text,
        html,
      })
      .then((info) => {
        console.log(getTestMessageUrl(info));
      })
      .catch((err) => {
        console.error('Failed to send email', err);
        emailStatus = EmailStatus.FAILURE;
      });

    // Log email
    await this.prisma.emailLog.create({
      data: {
        status: emailStatus,
        to,
        type: EmailType.AUDIT_CREATION,
      },
    });
  }

  sendAuditCreatedMail(audit: Audit) {
    const auditUrl = `${this.config.get('FRONT_BASE_URL')}/audits/${
      audit.editUniqueId
    }/generation`;

    const reportUrl = `${this.config.get('FRONT_BASE_URL')}/rapports/${
      audit.consultUniqueId
    }/resultats`;

    const data = {
      auditorName: audit.auditorName,
      procedureName: audit.procedureName,
      auditUrl,
      reportUrl,
    };

    return this.sendMail(audit.auditorEmail, EmailType.AUDIT_CREATION, data);
  }

  sendAccountVerificationEmail(username: string, token: string) {
    const baseUrl = this.config.get<string>('FRONT_BASE_URL');

    const verificationLink = `${baseUrl}/compte/validation?token=${encodeURIComponent(
      token,
    )}`;

    console.log(verificationLink);

    return this.sendMail(username, EmailType.ACCOUNT_VERIFICATION, {
      verificationLink,
    });
  }

  sendAccountConfirmationEmail(username: string) {
    return this.sendMail(username, EmailType.ACCOUNT_CONFIRMATION, null);
  }

  sendPasswordUpdateConfirmation(email: string) {
    return this.sendMail(email, EmailType.PASSWORD_UPDATE_CONFIRMATION, null);
  }
}
