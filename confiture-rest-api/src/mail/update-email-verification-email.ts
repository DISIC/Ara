import { renderMailTemplate } from "./render-mjml-template";

export interface UpdateEmailVerificationData {
  verificationLink: string;
}

export function subject(): string {
  return `Confirmer votre nouvelle adresse e-mail`;
}

export function html(data: UpdateEmailVerificationData): string {
  return renderMailTemplate("email-update-verification", data);
}

export function plain(data: UpdateEmailVerificationData): string {
  return `Pour finaliser le changement de votre adresse e-mail, cliquez sur le bouton ci-dessous :

${data.verificationLink}

Besoin d’aide ? Écrivez-nous : ara@design.numerique.gouv.fr
`;
}
