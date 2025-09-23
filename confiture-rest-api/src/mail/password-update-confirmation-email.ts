import { renderMailTemplate } from "./render-mjml-template";

export interface PasswordUpdateConfirmationEmailData {
  loginLink: string;
}

export function subject(): string {
  return `Votre mot de passe a bien été mis à jour`;
}

export function html(data: PasswordUpdateConfirmationEmailData): string {
  return renderMailTemplate("password-update-confirmation", data);
}

export function plain(data: PasswordUpdateConfirmationEmailData): string {
  return `
    Bonjour,

    Connectez-vous avec votre nouveau mot de passe pour accéder à votre espace : ${data.loginLink}

    Besoin d’aide ? Écrivez-nous : ara@design.numerique.gouv.fr
  `;
}
