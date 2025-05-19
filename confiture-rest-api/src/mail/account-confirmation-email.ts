import { renderMailTemplate } from "./render-mjml-template";

export function subject(): string {
  return `Ara : compte créé avec succès`;
}

export function html(): string {
  return renderMailTemplate("account-confirmation", null);
}

export function plain(): string {
  return `
    Bonjour,

    Votre compte Ara a été créé avec succès.

    Si vous avez des questions ou besoin d’aide, contactez notre support par e-mail à l’adresse : ara@design.numerique.gouv.fr.
  `;
}
