import { renderMailTemplate } from "./render-mjml-template";

export function subject(): string {
  return `Ara : mot de passe mis à jour avec succès `;
}

export function html(): string {
  return renderMailTemplate("password-update-confirmation", {});
}

export function plain(): string {
  return `
    Bonjour,

    Le mot de passe de votre compte Ara a bien été modifié.

    Si vous avez des questions ou besoin d’aide, contactez notre support par e-mail à l’adresse : ara@design.numerique.gouv.fr.
  `;
}
