import { renderMailTemplate } from "./render-mjml-template";

export interface AccountConfirmationEmailData {
  loginLink: string;
}

export function subject(): string {
  return `Votre compte a bien été créé`;
}

export function html(data: AccountConfirmationEmailData): string {
  return renderMailTemplate("account-confirmation", data);
}

export function plain(data: AccountConfirmationEmailData): string {
  return `
    Bonjour,

    Bienvenue sur Ara !

    Connectez-vous pour accéder à votre espace : ${data.loginLink}.
  `;
}
