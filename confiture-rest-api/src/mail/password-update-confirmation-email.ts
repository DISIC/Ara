import { renderMailTemplate } from './render-mjml-template';

export function subject(): string {
  return `Ara : mot de passe mis à jour avec succès `;
}

export function html(): string {
  return renderMailTemplate('password-update-confirmation', {});
}

export function plain(): string {
  return `
    Bonjour,

    Le mot de passe de votre compte Ara a bien été modifié.

    Vous avez une question ? Vous pouvez nous contacter en utilisant l’adresse e-mail ara@design.numerique.gouv.fr.
  `;
}
