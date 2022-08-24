export interface AuditRecipent {
  id: number;
  name: string;
  email: string;
}

export interface AuditEnvironment {
  id: number;
  platform: string;
  assistiveTechnology: string;
  browser: string;
}

export interface AuditPage {
  id: number;
  name: string;
  url: string;
}

export enum AuditType {
  FAST = "FAST",
  COMPLEMENTARY = "COMPLEMENTARY",
  FULL = "FULL",
}

/** An audit object as returned by the API. */
export interface Audit {
  id: number;
  editUniqueId: string;
  consultUniqueId: string;

  // Step 1
  initiator: string;

  procedureName: string;
  procedureUrl: string;

  contactName: string | null;
  contactEmail: string;
  contactFormUrl: string;

  auditorName: string;
  auditorEmail: string;

  recipients: AuditRecipent[];

  // Step 2
  auditType: null | AuditType;
  auditTools: string[];
  environments: AuditEnvironment[];
  pages: AuditPage[];

  publicationDate?: string;
  editionDate?: string;
}

/** Audit type but without the generated IDs and step 2 fields */
export type CreateAuditRequestData = Pick<
  Audit,
  | "initiator"
  | "procedureName"
  | "procedureUrl"
  | "contactName"
  | "contactEmail"
  | "contactFormUrl"
  | "auditorName"
  | "auditorEmail"
> & {
  recipients: Omit<AuditRecipent, "id">[];
};

/** Creation data type plus step 2 fields. */
export type UpdateAuditRequestData = CreateAuditRequestData &
  Pick<Audit, "auditType" | "auditTools"> & {
    environments: Omit<AuditEnvironment, "id">[];
    pages: Omit<AuditPage, "id">[];
  };

export interface CreateFeedbackRequestData {
  easyToUse: string;
  easyToUnderstand: string;

  feedback: string;
  suggestions: string;

  name?: string;
  email?: string;
  occupations?: string[];
}

export enum CriteriumResultStatus {
  NOT_TESTED = "NOT_TESTED",
  COMPLIANT = "COMPLIANT",
  NOT_COMPLIANT = "NOT_COMPLIANT",
  NOT_APPLICABLE = "NOT_APPLICABLE",
}

export enum CriterionResultUserImpact {
  MINOR = "MINOR",
  MAJOR = "MAJOR",
  BLOCKING = "BLOCKING",
}
export interface CriteriumResult {
  // ID
  topic: number;
  criterium: number;
  pageUrl: string;

  // DATA
  status: CriteriumResultStatus;

  compliantComment: string | null;
  errorDescription: string | null;
  userImpact: CriterionResultUserImpact | null;
  recommandation: string | null;
  notApplicableComment: string | null;
}
