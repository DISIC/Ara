import { renderMailTemplate } from "./render-mjml-template";

export interface AuditCreationEmailData {
  procedureName: string;
  overviewUrl: string;
  reportUrl: string;
  is106Criteria: boolean;
}

export function subject(data: AuditCreationEmailData): string {
  return `Accéder à votre audit : « ${data.procedureName} »`;
}

export function html(data: AuditCreationEmailData): string {
  return renderMailTemplate("audit-creation", data);
}

export function plain(data: AuditCreationEmailData): string {
  return `
    Accéder à votre audit et rapport

    Vous venez de créer l’audit « ${data.procedureName} ».
    Pour accéder à votre audit ${
      data.is106Criteria
        ? ", rapport d’audit et déclaration d’accessibilité"
        : "et rapport d’audit"
    }, utilisez le lien ci-dessous :

    ${data.overviewUrl}

    Si vous avez des questions ou besoin d’aide, contactez notre support par e-mail à l’adresse : ara@design.numerique.gouv.fr.
  `;
}
