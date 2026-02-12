import { renderMailTemplate } from "./render-mjml-template";

export interface UpdateEmailConfirmationData {
  newEmail: string;
}

export function subject(): string {
  return `Votre adresse e-mail a bien été mise à jour`;
}

export function html(): string {
  return renderMailTemplate("email-update-confirmation", {});
}

export function plain(): string {
  return `L’adresse e-mail de votre compte Ara a bien bien été modifiée.

Besoin d’aide ? Écrivez-nous : ara@design.numerique.gouv.fr
`;
}
