export interface AuditRecipent {
  id: number;
  name: string;
  email: string;
}

export interface Audit {
  id: number;
  editUniqueId: string;
  consultUniqueId: string;

  initiator: string;

  procedureName: string;
  procedureUrl: string;

  contactName: string | null;
  contactEmail: string;
  contactFormUrl: string;

  auditorName: string;
  auditorEmail: string;

  recipients: AuditRecipent[];
}

/** Audit type but without the generated IDs */
export type CreateAuditRequestData = Omit<
  Audit,
  "id" | "editUniqueId" | "consultUniqueId" | "recipients"
> & { recipients: Omit<AuditRecipent, "id">[] };

export type UpdateAuditRequestData = CreateAuditRequestData;

export interface CreateFeedbackRequestData {
  easyToUse: string;
  easyToUnderstand: string;

  feedback: string;
  suggestions: string;

  name?: string;
  email?: string;
  occupations?: string[];
}
