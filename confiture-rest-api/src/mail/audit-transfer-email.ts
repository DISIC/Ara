import { renderMailTemplate } from "./render-mjml-template";

export interface AuditTransferEmailData {
  procedureName: string;
  auditUrl: string;
  senderEmail: string;
  senderName: string;
}

export function subject(): string {
  return "Un audit vous a été transféré";
}

export function html(data: AuditTransferEmailData): string {
  return renderMailTemplate("audit-transfer", data);
}

export function plain(data: AuditTransferEmailData): string {
  return `Un audit vous a été transféré

    ${data.senderName ? data.senderName + " (" + data.senderEmail + ")" : data.senderEmail} vous a transféré l’audit «&nbsp;${data.procedureName}&nbsp;». Si vous possédez un compte Ara, vous retrouverez cet audit dans votre espace.

    ${data.auditUrl}

    Besoin d’aide&#8239;? Écrivez-nous&nbsp;: ara@design.numerique.gouv.fr
  `;
}
