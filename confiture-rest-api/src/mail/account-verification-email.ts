import { renderMailTemplate } from "./render-mjml-template";

export interface AccountVerificationEmailData {
  verificationLink: string;
}

export function subject(): string {
  return `Ara : vérification du compte`;
}

export function html(data: AccountVerificationEmailData): string {
  return renderMailTemplate("account-verification", data);
}

export function plain(data: AccountVerificationEmailData): string {
  return `
    Bonjour,

    Pour finalisez la création de votre compte, veuillez cliquer sur le lien suivant : : ${data.verificationLink}. Ce lien est valable 1h.

    Si vous ne voulez pas créer de compte sur Ara ou si vous n’avez pas demandé à créer de compte, vous pouvez ignorer et supprimer cet e-mail.

    Si vous avez des questions ou besoin d’aide, contactez notre support par e-mail à l’adresse : ara@design.numerique.gouv.fr.
  `;
}
