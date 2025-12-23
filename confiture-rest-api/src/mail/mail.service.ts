import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createTransport, getTestMessageUrl, Transporter } from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { Audit, AuditType, EmailStatus, EmailType } from "../generated/prisma/client";

import { PrismaService } from "../prisma.service";
import * as accountConfirmationEmail from "./account-confirmation-email";
import * as accountVerificationEmail from "./account-verification-email";
import * as auditCreationEmail from "./audit-creation-email";
import { AuditCreationEmailData } from "./audit-creation-email";
import { EmailConfig } from "./email-config.interface";
import * as passwordUpdateConfirmationEmail from "./password-update-confirmation-email";
import * as requestPasswordResetEmail from "./request-password-reset-email";
import * as updateEmailConfirmationEmail from "./update-email-confirmation-email";
import * as updateEmailVerificationEmail from "./update-email-verification-email";

const EMAILS: Record<EmailType, EmailConfig> = {
  [EmailType.AUDIT_CREATION]: auditCreationEmail,
  [EmailType.ACCOUNT_VERIFICATION]: accountVerificationEmail,
  [EmailType.ACCOUNT_CONFIRMATION]: accountConfirmationEmail,
  [EmailType.PASSWORD_UPDATE_CONFIRMATION]: passwordUpdateConfirmationEmail,
  [EmailType.EMAIL_UPDATE_VERIFICATION]: updateEmailVerificationEmail,
  [EmailType.EMAIL_UPDATE_CONFIRMATION]: updateEmailConfirmationEmail,
  [EmailType.PASSWORD_RESET_REQUEST]: requestPasswordResetEmail
};

@Injectable()
export class MailService {
  private readonly transporter: Transporter<SMTPTransport.SentMessageInfo>;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService
  ) {
    this.transporter = createTransport({
      host: config.get("MAILER_SMTP_HOST"),
      port: config.get("MAILER_SMTP_PORT"),
      secure: config.get<boolean>("MAILER_SMTP_SECURE"),
      auth: {
        user: config.get("MAILER_USER"),
        pass: config.get("MAILER_PASSWORD")
      }
    });
  }

  private async sendMail(
    to: string,
    type: EmailType,
    data: Record<string, any>
  ) {
    let emailStatus: EmailStatus = EmailStatus.SUCCESS;

    const subject = EMAILS[type].subject(data);
    const text = EMAILS[type].plain(data);
    const html = EMAILS[type].html(data);

    await this.transporter
      .sendMail({
        from: `Ara ${this.config.get("MAILER_USER")}`,
        to,
        subject,
        text,
        html
      })
      .then((info) => {
        console.log(getTestMessageUrl(info));
      })
      .catch((err) => {
        console.error("Failed to send email", err);
        emailStatus = EmailStatus.FAILURE;
      });

    // Log email
    await this.prisma.emailLog.create({
      data: {
        status: emailStatus,
        to,
        type: EmailType.AUDIT_CREATION
      }
    });
  }

  sendAuditCreatedMail(audit: Pick<Audit, "editUniqueId" | "consultUniqueId" | "procedureName" | "auditType" | "auditorEmail">) {
    const overviewUrl = `${this.config.get("FRONT_BASE_URL")}/audits/${
      audit.editUniqueId
    }/synthese`;

    const reportUrl = `${this.config.get("FRONT_BASE_URL")}/rapports/${
      audit.consultUniqueId
    }`;

    const data: AuditCreationEmailData = {
      procedureName: audit.procedureName,
      overviewUrl,
      reportUrl,
      is106Criteria: audit.auditType === AuditType.FULL
    };

    return this.sendMail(audit.auditorEmail, EmailType.AUDIT_CREATION, data);
  }

  sendAccountVerificationEmail(username: string, token: string) {
    const baseUrl = this.config.get<string>("FRONT_BASE_URL");

    const verificationLink = `${baseUrl}/compte/validation?token=${encodeURIComponent(
      token
    )}`;

    return this.sendMail(username, EmailType.ACCOUNT_VERIFICATION, {
      verificationLink
    });
  }

  sendAccountConfirmationEmail(username: string) {
    const baseUrl = this.config.get<string>("FRONT_BASE_URL");

    const loginLink = `${baseUrl}/compte/connexion`;

    return this.sendMail(username, EmailType.ACCOUNT_CONFIRMATION, {
      loginLink
    });
  }

  sendPasswordUpdateConfirmation(email: string) {
    const baseUrl = this.config.get<string>("FRONT_BASE_URL");

    const loginLink = `${baseUrl}/compte/connexion`;

    return this.sendMail(email, EmailType.PASSWORD_UPDATE_CONFIRMATION, {
      loginLink
    });
  }

  sendNewEmailVerificationEmail(email: string, token: string) {
    const baseUrl = this.config.get<string>("FRONT_BASE_URL");

    const verificationLink = `${baseUrl}/compte/email-update-validation?token=${encodeURIComponent(
      token
    )}`;

    return this.sendMail(email, EmailType.EMAIL_UPDATE_VERIFICATION, {
      verificationLink
    });
  }

  sendEmailUpdateConfirmationEmail(email: string) {
    return this.sendMail(email, EmailType.EMAIL_UPDATE_CONFIRMATION, {
      newEmail: email
    });
  }

  sendPasswordResetEmail(email: string, token: string) {
    const baseUrl = this.config.get<string>("FRONT_BASE_URL");

    const verificationLink = `${baseUrl}/compte/reinitialiser-mot-de-passe?token=${encodeURIComponent(
      token
    )}`;

    return this.sendMail(email, EmailType.PASSWORD_RESET_REQUEST, {
      verificationLink
    });
  }
}
