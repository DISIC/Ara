import { AuditType } from "./types";

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
 * Format an audit type string into french.
 */
export function formatAuditType(auditType: AuditType): string {
  return FORMATTED_TYPES[auditType];
}

/**
 * Get a CSS variable value from the root element.
 */
export function getCssVarValue(varName: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(varName);
}
