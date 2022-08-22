import { AuditType, AssistiveTechnology, Browser } from "./types";

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

const FORMATTED_ASSISTIVE_TECHNOLOGY = {
  [AssistiveTechnology.JAWS_LATEST]: "JAWS (dernière version)",
  [AssistiveTechnology.JAWS_PREVIOUS]: "JAWS (version précédente)",
  [AssistiveTechnology.NVDA_LATEST]: "NVDA (dernière version)",
  [AssistiveTechnology.NVDA_PREVIOUS]: "NVDA (version précédente)",
  [AssistiveTechnology.VOICEOVER_LATEST]: "VoiceOver (dernière version)",
  [AssistiveTechnology.VOICEOVER_PREVIOUS]: "VoiceOver (version précédente)",
};

/**
 * Format an assistive technology type string into French.
 */
export function formatAssistiveTechnology(
  technology: AssistiveTechnology
): string {
  return FORMATTED_ASSISTIVE_TECHNOLOGY[technology];
}

const FORMATTED_BROWSER = {
  [Browser.CHROME]: "Google Chrome",
  [Browser.FIREFOX]: "Firefox",
  [Browser.SAFARI]: "Safari",
  [Browser.EDGE]: "Edge",
};

/**
 * Format an browser type string into French.
 */
export function formatBrowser(browser: Browser): string {
  return FORMATTED_BROWSER[browser];
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
 * Get a CSS variable value from the root element.
 */
export function getCssVarValue(varName: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(varName);
}
