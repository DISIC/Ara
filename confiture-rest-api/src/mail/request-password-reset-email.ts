import { renderMailTemplate } from "./render-mjml-template";

export interface RequestPasswordResetEmailData {
  verificationLink: string;
}

export function subject(): string {
  return `Réinitialiser votre mot de passe`;
}

export function html(data: RequestPasswordResetEmailData): string {
  return renderMailTemplate("request-password-reset", data);
}

export function plain(data: RequestPasswordResetEmailData): string {
  return `Bonjour,

Pour changer le mot de passe de votre compte, cliquez sur le bouton ci-dessous :
    
${data.verificationLink}

Besoin d’aide ? Écrivez-nous : ara@design.numerique.gouv.fr
`;
}
