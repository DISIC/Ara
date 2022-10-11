import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Audit } from '@prisma/client';
import { createTransport, getTestMessageUrl, Transporter } from 'nodemailer';
import { buildEmailHtmlTemplate, buildEmailTextTemplate } from './build-email-template'

@Injectable()
export class MailerService {
  private readonly transporter: Transporter;

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

  private sendMail(to: string, subject: string, text: string, html: string) {
    return this.transporter
      .sendMail({
        from: this.config.get('MAILER_USER'),
        to,
        subject,
        text,
        html
      })
      .then((info) => {
        // TODO: check if the test url thing works with "real" email addresses
        console.log('Preview URL: ' + getTestMessageUrl(info));
      });
  }

  sendAuditCreatedMail(audit: Audit) {
    const auditUrl = `${this.config.get('FRONT_BASE_URL')}/audits/${
      audit.editUniqueId
    }`;
    return this.sendMail(
      audit.auditorEmail,
      `Création d’un nouvel audit : ${audit.procedureName}`,
      buildEmailTextTemplate(audit.auditorName, audit.procedureName, auditUrl),
      buildEmailHtmlTemplate(audit.auditorName, audit.procedureName, auditUrl),
    );
  }
}
