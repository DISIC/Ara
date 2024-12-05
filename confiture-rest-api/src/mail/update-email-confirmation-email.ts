import { renderMailTemplate } from "./render-mjml-template";

export interface UpdateEmailConfirmationData {
  newEmail: string;
}

export function subject(): string {
  return `Ara : adresse e-mail mise à jour avec succès`;
}

export function html(data: UpdateEmailConfirmationData): string {
  return renderMailTemplate("email-update-confirmation", data);
}

export function plain(data: UpdateEmailConfirmationData): string {
  return `Bonjour,

L’adresse e-mail de votre compte Ara a bien été modifiée. La prochaine fois que vous vous connectez à votre compte, assurez-vous que vous utilisez l’adresse e-mail : ${data.newEmail}.

Si vous avez des questions ou besoin d’aide, contactez notre support par e-mail à l’adresse : ara@design.numerique.gouv.fr.
`;
}
