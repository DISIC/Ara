import { RouterScrollBehavior } from "vue-router";

import {
  AuditListingItemDtoStatus,
  components,
  CreateDebugAuditDtoAuditType,
  CriterionResultDtoStatus,
  CriterionResultDtoUserImpact,
  paths
} from "./confiture-api";

export interface AuditEnvironment {
  id: number;
  platform: string;
  operatingSystem: string;
  assistiveTechnology: string;
  browser: string;
}

export interface AuditPage {
  id: number;
  order: number;
  name: string;
  url: string;
}

export type PageElements = components["schemas"]["PageElements"];

export { CreateDebugAuditDtoAuditType as AuditType };

export type AuditTypeString = `${CreateDebugAuditDtoAuditType}`;

// FIXME: missing PUBLISHABLE ?
export { AuditListingItemDtoStatus as AuditStatus };

/** An audit object as returned by the API. */
export type Audit = components["schemas"]["AuditDto"];

/** Audit type fields needed to create an audit */
export type CreateAuditRequestData = paths["/audits"]["post"]["requestBody"]["content"]["application/json"];

/** Creation data type plus step 2 fields. */
export type UpdateAuditRequestData = Omit<Audit, "environments" | "pages"> & {
  environments: Omit<AuditEnvironment, "id">[];
  pages: Omit<AuditPage, "id" | "order">[];
};

export type UpdateAuditStatementRequestData =
  paths["/audits/{editUniqueId}/statement"]["put"]["requestBody"]["content"]["application/json"];

export type CreateDebugAuditRequestData =
  paths["/debug/create-audit"]["post"]["requestBody"]["content"]["application/json"];

export { CriterionResultDtoStatus as CriteriumResultStatus };

export { CriterionResultDtoUserImpact as CriterionResultUserImpact };

/** File attached to audit notes. */
export type NotesFile = components["schemas"]["NotesFileDto"];

/** Image file attached to specific criterium result when not compliant. */
export type ExampleImageFile = components["schemas"]["ExampleImageFileDto"];

// a bug in openapi-typescript erroneously generate nullable enum properties as non nullable
// https://github.com/openapi-ts/openapi-typescript/issues/1872#issuecomment-2399197613
export type CriteriumResult = Omit<components["schemas"]["CriterionResultDto"], "userImpact"> & { userImpact: CriterionResultDtoUserImpact | null };

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
