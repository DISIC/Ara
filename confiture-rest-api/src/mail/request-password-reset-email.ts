import { renderMailTemplate } from "./render-mjml-template";

export interface RequestPasswordResetEmailData {
  verificationLink: string;
}

export function subject(): string {
  return `Ara : réinitialiser votre mot de passe `;
}

export function html(data: RequestPasswordResetEmailData): string {
  return renderMailTemplate("request-password-reset", data);
}

export function plain(data: RequestPasswordResetEmailData): string {
  return `Bonjour,

Pour réinitialiser le mot de passe de votre compte Ara, veuillez cliquer sur le lien ci-dessous : 
    
${data.verificationLink}

Vous avez une question ? Vous pouvez nous contacter en utilisant l’adresse e-mail ara@design.numerique.gouv.fr.
`;
}
