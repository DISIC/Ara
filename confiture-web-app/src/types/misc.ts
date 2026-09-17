import { RouterScrollBehavior } from "vue-router";

export enum StoreName {
  AUDIT_STORE = "AUDIT_STORE",
  RESULTS_STORE = "RESULTS_STORE"
}

// Routing
export type ScrollBehaviorResult = ReturnType<RouterScrollBehavior>;
export type ScrollPosition = Awaited<ScrollBehaviorResult>;

/**
 * Tab data interface used in AraTabs
 *
 * If all slugs (created from labels) are guaranted to be different,
 * no need to use an id here.
 * If an id is used, "-[id]" will be appended to the created slug.
 * e.g. "contact-233"
 */
export interface TabData {
  label: string;
  diplayLabelSuffix?: string;
  hiddenLabelSuffix?: string;
  id?: number;
  icon?: string;
  component: object;
  componentParams?: object;
}
