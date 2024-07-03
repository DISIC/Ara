import { AuditFile, AuditType, CriteriumResult } from "../types";

export interface AuditReport {
  consultUniqueId: string;

  contactEmail?: string;
  contactFormUrl?: string;

  procedureInitiator?: string;
  procedureName: string;
  procedureUrl?: string;

  creationDate?: string;
  publishDate?: string;
  updateDate?: string;

  notCompliantContent?: string;
  derogatedContent?: string;
  notInScopeContent?: string;
  notes?: string;
  notesFiles: AuditFile[];

  auditType: AuditType;

  context: AuditReportContext;

  accessibilityRate: number;

  criteriaCount: {
    total: number;
    compliant: number;
    notCompliant: number;
    blocking: number;
    applicable: number;
    notApplicable: number;
  };

  /** Global distribution of criteria by result */
  resultDistribution: ResultDistribution;

  /** Distribution of criteria by page */
  pageDistributions: PageResultDistribution[];

  /** Distribution of criteria by topic */
  topicDistributions: TopicResultDistribution[];

  results: Array<ReportCriteriumResult>;
}

export type ReportCriteriumResult = Omit<CriteriumResult, "exampleImages"> & {
  exampleImages: {
    key: string;
    thumbnailKey: string;
    filename: string;
  }[];
};

interface ResultDistribution {
  compliant: {
    raw: number;
    percentage: number;
  };
  notCompliant: {
    raw: number;
    percentage: number;
  };
  notApplicable: {
    raw: number;
    percentage: number;
  };
}

interface PageResultDistribution extends ResultDistribution {
  name: string;
}

interface TopicResultDistribution extends ResultDistribution {
  name: string;
}

interface AuditReportContext {
  referencial: string;

  auditorName: string;
  auditorEmail: string | null;
  auditorOrganisation: string;

  technologies: string[];

  samples: PageSample[];

  tools: string[];

  desktopEnvironments: Environment[];
  mobileEnvironments: Environment[];
}

interface PageSample {
  // number: number;
  id: number;
  order: number;
  name: string;
  url: string;
}

interface Environment {
  operatingSystem: string;
  operatingSystemVersion?: string;
  assistiveTechnology: string;
  assistiveTechnologyVersion?: string;
  browser: string;
  browserVersion?: string;
}
