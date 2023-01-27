import {
  AuditReport,
  AuditType,
  AuditStatus,
  CriterionResultUserImpact,
  CriteriumResultStatus,
} from "./types";

import baseSlugify from "slugify";

const formatter = new Intl.DateTimeFormat("fr-FR", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

/**
 * Format a string intro a readable date ("17 août 2022")
 */
export function formatDate(dateString: string): string {
  return formatter.format(new Date(dateString));
}

const FORMATTED_TYPES = {
  [AuditType.COMPLEMENTARY]: "Complémentaire",
  [AuditType.FAST]: "Rapide",
  [AuditType.FULL]: "Complet",
};

/**
 * Format an audit type string into French.
 */
export function formatAuditType(auditType: AuditType): string {
  return FORMATTED_TYPES[auditType];
}

const FORMATTED_USER_IMPACT = {
  [CriterionResultUserImpact.MINOR]: "mineur",
  [CriterionResultUserImpact.MAJOR]: "majeur",
  [CriterionResultUserImpact.BLOCKING]: "bloquant",
};

/**
 * Format a criterion result user impact type string into French.
 */
export function formatUserImpact(
  userImpact: CriterionResultUserImpact
): string {
  return FORMATTED_USER_IMPACT[userImpact];
}

// TODO: replace everywhere in the app
const FORMATTED_STATUS = {
  [CriteriumResultStatus.NOT_TESTED]: "Non testé",
  [CriteriumResultStatus.COMPLIANT]: "Conforme",
  [CriteriumResultStatus.NOT_COMPLIANT]: "Non conforme",
  [CriteriumResultStatus.NOT_APPLICABLE]: "Non applicable",
};

/**
 * Format a criterion result status type string into French.
 */
export function formatStatus(status: CriteriumResultStatus): string {
  return FORMATTED_STATUS[status];
}

const CRITERIA_COUNT = {
  [AuditType.FAST]: 25,
  [AuditType.COMPLEMENTARY]: 50,
  [AuditType.FULL]: 106,
};

/**
 * Return the number of criteria for a given audit type.
 */
export function getCriteriaCount(auditType: AuditType): number {
  return CRITERIA_COUNT[auditType];
}

/**
 * Return the audit status based on the completion of criteria and a11y statement.
 */
export function getAuditStatus(report: AuditReport): string {
  if (
    report.results.some((r) => r.status === CriteriumResultStatus.NOT_TESTED)
  ) {
    return AuditStatus.IN_PROGRESS;
  }

  if (report.procedureInitiator) {
    return AuditStatus.PUBLISHABLE;
  }

  return AuditStatus.COMPLETED;
}

/**
 * Get a CSS variable value from the root element.
 */
export function getCssVarValue(varName: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(varName);
}

export function slugify(value: string): string {
  return baseSlugify(value, { strict: true, lower: true });
}

export function formatBytes(bytes: number, decimals = 0) {
  if (!+bytes) return "0 octets";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["octets", "Ko", "Mo", "Go", "To", "Po", "Eo", "Zo", "Yo"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
