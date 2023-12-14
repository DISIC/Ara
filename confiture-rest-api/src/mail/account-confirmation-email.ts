import { renderMailTemplate } from "./render-mjml-template";

export function subject(): string {
  return `Ara : compte créé avec succès`;
}

export function html(): string {
  return renderMailTemplate("account-confirmation", null);
}

export function plain(): string {
  return `
    Bonjour,

    Votre compte Ara a été créé avec succès.

    Vous avez une question ? Vous pouvez nous contacter en utilisant l’adresse e-mail ara@design.numerique.gouv.fr.
  `;
}
