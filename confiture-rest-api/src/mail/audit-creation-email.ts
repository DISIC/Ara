import { renderMailTemplate } from './render-mjml-template';

export interface AuditCreationEmailData {
  auditorName: string;
  procedureName: string;
  auditUrl: string;
  reportUrl: string;
}

export function subject(data: AuditCreationEmailData): string {
  return `Création d’un nouvel audit : ${data.procedureName}`;
}

export function html(data: AuditCreationEmailData): string {
  return renderMailTemplate('audit-creation', data);
}

export function plain(data: AuditCreationEmailData): string {
  return `
    Bonjour ${data.auditorName}, vous venez de créer l’audit "${data.procedureName}".

    Vous trouverez ci-dessous le lien administrateur de l’audit. Pensez bien à le conserver, c’est le seul moyen de reprendre l’édition de l’audit.
    ${data.auditUrl}

    Vous trouverez ci-dessous le lien public du rapport d’audit. Il vous permet de consulter et vérifier le rapport d’audit. Vous devrez le partager une fois que l’audit sera terminé.
    ${data.reportUrl}

    Vous avez une question ? Vous pouvez nous contacter en utilisant l’adresse e-mail ara@design.numerique.gouv.fr.
  `;
}
