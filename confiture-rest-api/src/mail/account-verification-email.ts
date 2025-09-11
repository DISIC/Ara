import { renderMailTemplate } from "./render-mjml-template";

export interface AccountVerificationEmailData {
  verificationLink: string;
}

export function subject(): string {
  return `Confirmer votre adresse e-mail`;
}

export function html(data: AccountVerificationEmailData): string {
  return renderMailTemplate("account-verification", data);
}

export function plain(data: AccountVerificationEmailData): string {
  return `
    Bonjour,

    Pour finaliser la création de votre compte, cliquez sur le bouton ci-dessous :
    
    ${data.verificationLink}
    Cette action est possible pendant 1 heure.

    Si vous n’avez pas demandé la création de ce compte, vous pouvez ignorer et supprimer cet e-mail.

    Besoin d’aide ? Écrivez-nous : ara@design.numerique.gouv.fr
  `;
}
