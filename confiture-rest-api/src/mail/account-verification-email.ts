import { renderMailTemplate } from './render-mjml-template';

export interface AccountVerificationEmailData {
  verificationLink: string;
}

export function subject(): string {
  return `Ara : vérification du compte`;
}

export function html(data: AccountVerificationEmailData): string {
  return renderMailTemplate('account-verification', data);
}

export function plain(data: AccountVerificationEmailData): string {
  return `
    Bonjour,".

    Lien de vérification : ${data.verificationLink}

    Vous avez une question ? Vous pouvez nous contacter en utilisant l’adresse e-mail ara@design.numerique.gouv.fr.
  `;
}
