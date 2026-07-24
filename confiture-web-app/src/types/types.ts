import { RouterScrollBehavior } from "vue-router";

import {
  AuditListingItemDtoStatus,
  components,
  CreateDebugAuditDtoAuditType,
  CriterionResultDtoStatus,
  paths,
  NotCompliantItemDtoUserImpact
} from "./confiture-api";

export type AuditEnvironment = components["schemas"]["TestEnvironmentDto"];

export type AuditPage = components["schemas"]["PageDto"];

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

export { NotCompliantItemDtoUserImpact as CriterionResultUserImpact };

/** File attached to audit notes. */
export type NotesFile = components["schemas"]["NotesFileDto"];

/** Image file attached to specific criterium result when not compliant. */
export type ExampleImageFile = components["schemas"]["ExampleImageFileDto"];

// a bug in openapi-typescript erroneously generate nullable enum properties as non nullable
// https://github.com/openapi-ts/openapi-typescript/issues/1872#issuecomment-2399197613
export type NotCompliantItem = Omit<components["schemas"]["NotCompliantItemDto"], "userImpact"> & { userImpact: NotCompliantItemDtoUserImpact | null };
export type CriteriumResult = Omit<components["schemas"]["CriterionResultDto"], "notCompliantItems"> & { notCompliantItems: NotCompliantItem[] };

export type CreateNotCompliantItemData = paths["/audits/{uniqueId}/pages/{slug}/results/{topic}.{criterium}/not-compliant-items"]["post"]["requestBody"]["content"]["application/json"];

export type UpdateNotCompliantItemData = paths["/audits/{uniqueId}/pages/{slug}/results/{topic}.{criterium}/not-compliant-items/{itemId}"]["patch"]["requestBody"]["content"]["application/json"];

export type PatchNotCompliantItemData = { id: number } & Partial<
  Omit<NotCompliantItem, "id">
>;

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
