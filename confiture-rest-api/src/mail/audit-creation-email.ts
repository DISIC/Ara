import { renderMailTemplate } from "./render-mjml-template";

export interface AuditCreationEmailData {
  procedureName: string;
  overviewUrl: string;
  reportUrl: string;
}

export function subject(data: AuditCreationEmailData): string {
  return `Création d’un nouvel audit : ${data.procedureName}`;
}

export function html(data: AuditCreationEmailData): string {
  return renderMailTemplate("audit-creation", data);
}

export function plain(data: AuditCreationEmailData): string {
  return `
    Bonjour, vous venez de créer l’audit "${data.procedureName}".

    Voici le lien de la synthèse d’audit (privé) permettant d’accéder aux documents suivants : l’audit, le rapport d’audit et la déclaration d’accessibilité (dans le cas d’un audit 106 critères). Pensez-bien à conserver ce lien, c’est le seul moyen d’accéder à vos documents.
    ${data.overviewUrl}

    Voici le lien du rapport d’audit (public) : ${data.reportUrl}

    Vous avez une question ? Vous pouvez nous contacter en utilisant l’adresse e-mail ara@design.numerique.gouv.fr.
  `;
}
