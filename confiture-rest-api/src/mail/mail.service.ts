import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Audit } from '@prisma/client';
import { createTransport, Transporter } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import * as auditCreationEmail from './audit-creation-email';

@Injectable()
export class MailService {
  private readonly transporter: Transporter<SMTPTransport.SentMessageInfo>;

  constructor(private readonly config: ConfigService) {
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
    subject: string,
    text: string,
    html: string,
  ) {
    await this.transporter
      .sendMail({
        from: this.config.get('MAILER_USER'),
        to,
        subject,
        text,
        html,
      })
      .then((info) => {
        console.log('Email sent', info);
      })
      .catch((err) => {
        console.error('Failed to send email', err);
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

    // FIXME: what to do if the mail fails to send for some reason ?
    return this.sendMail(
      audit.auditorEmail,
      `Création d’un nouvel audit : ${audit.procedureName}`,
      auditCreationEmail.plainText(data),
      auditCreationEmail.html(data),
    );
  }
}
