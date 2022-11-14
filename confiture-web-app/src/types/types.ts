export interface AuditRecipent {
  id: number;
  name: string;
  email: string;
}

export interface AuditTool {
  name: string;
  function: string;
  url: string;
}

export interface AuditEnvironment {
  id: number;
  platform: string;
  operatingSystem: string;
  operatingSystemVersion: string;
  assistiveTechnology: string;
  assistiveTechnologyVersion: string;
  browser: string;
  browserVersion: string;
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

  publicationDate: string | null;
  editionDate: string | null;

  // Audit creation
  auditType: AuditType;
  procedureName: string;
  pages: AuditPage[];
  auditorEmail: string;
  auditorName: string | null;
  auditorOrganisation: string;

  // A11y declaration edition
  technologies: string[];
  procedureUrl: string | null;
  initiator: string | null;
  tools: AuditTool[];
  environments: AuditEnvironment[];
  contactName: string | null;
  contactEmail: string | null;
  contactFormUrl: string | null;
  notCompliantContent: string | null;
  derogatedContent: string | null;
  notInScopeContent: string | null;
}

/** Audit type but without the generated IDs and step 2 fields */
export type CreateAuditRequestData = Pick<
  Audit,
  | "auditType"
  | "procedureName"
  | "auditorEmail"
  | "auditorName"
  | "auditorOrganisation"
> & { pages: Omit<AuditPage, "id">[] };

/** Creation data type plus step 2 fields. */
export type UpdateAuditRequestData = Omit<
  Audit,
  "tools" | "environments" | "pages"
> & {
  tools: Omit<AuditTool, "id">[];
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
  pageId: number;

  // DATA
  status: CriteriumResultStatus;

  compliantComment: string | null;
  errorDescription: string | null;
  userImpact: CriterionResultUserImpact | null;
  recommandation: string | null;
  notApplicableComment: string | null;
}
