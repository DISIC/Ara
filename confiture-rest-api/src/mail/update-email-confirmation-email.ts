import { renderMailTemplate } from './render-mjml-template';

export interface UpdateEmailConfirmationData {
  newEmail: string;
}

export function subject(): string {
  return `Ara : adresse e-mail mise à jour avec succès`;
}

export function html(data: UpdateEmailConfirmationData): string {
  return renderMailTemplate('email-update-confirmation', data);
}

export function plain(data: UpdateEmailConfirmationData): string {
  return `Bonjour,

L’adresse e-mail de votre compte Ara a bien été modifiée. La prochaine fois que vous vous connectez à votre compte, assurez-vous que vous utilisez l’adresse e-mail : ${data.newEmail}.

Vous avez une question ? Vous pouvez nous contacter en utilisant l’adresse e-mail ara@design.numerique.gouv.fr.
`;
}
