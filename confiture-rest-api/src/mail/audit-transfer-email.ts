import { renderMailTemplate } from "./render-mjml-template";

export interface AuditTransferEmailData {
  procedureName: string;
  auditUrl: string;
  originEmail: string;
  name: string;
}

export function subject(): string {
  return "Un audit vous a été transféré";
}

export function html(data: AuditTransferEmailData): string {
  return renderMailTemplate("audit-transfer", data);
}

export function plain(data: AuditTransferEmailData): string {
  return `
    Un audit vous a été transféré

    ${data.name ? data.name + " (" + data.originEmail + ")" : data.originEmail}
    vous a transféré l’audit « ${data.procedureName} ». Si vous possédez un compte Ara, vous retrouverez cet audit dans votre espace.

    ${data.auditUrl}

    Besoin d’aide ? Écrivez-nous : ara@design.numerique.gouv.fr
  `;
}
