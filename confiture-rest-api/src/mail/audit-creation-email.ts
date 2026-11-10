import { renderMailTemplate } from "./render-mjml-template";

export interface AuditCreationEmailData {
  procedureName: string;
  overviewUrl: string;
  reportUrl: string;
  is106Criteria: boolean;
}

export function subject(data: AuditCreationEmailData): string {
  return `Accéder à l’audit «&nbsp;${data.procedureName}&nbsp;»`;
}

export function html(data: AuditCreationEmailData): string {
  return renderMailTemplate("audit-creation", data);
}

export function plain(data: AuditCreationEmailData): string {
  return `
    Accéder à l’audit

    Vous venez de créer l’audit «&nbsp;${data.procedureName}&nbsp;».
    Pour accéder à votre audit ${
      data.is106Criteria
        ? ", rapport d’audit et déclaration d’accessibilité"
        : "et rapport d’audit"
    }, utilisez le lien ci-dessous&nbsp;:

    ${data.overviewUrl}

    Besoin d’aide&#8239;? Écrivez-nous&nbsp;: ara@design.numerique.gouv.fr
  `;
}
