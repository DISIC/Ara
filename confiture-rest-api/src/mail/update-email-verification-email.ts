import { renderMailTemplate } from "./render-mjml-template";

export interface UpdateEmailVerificationData {
  verificationLink: string;
}

export function subject(): string {
  return `Ara : vérification de la nouvelle adresse e-mail`;
}

export function html(data: UpdateEmailVerificationData): string {
  return renderMailTemplate("email-update-verification", data);
}

export function plain(data: UpdateEmailVerificationData): string {
  return `Bonjour,

Pour finaliser le changement d’adresse e-mail associée à votre compte Ara, nous devons vérifier votre nouvelle adresse. Veuillez cliquer sur le bouton ci-dessous :

${data.verificationLink}

Si vous avez des questions ou besoin d’aide, contactez notre support par e-mail à l’adresse : ara@design.numerique.gouv.fr.
`;
}
