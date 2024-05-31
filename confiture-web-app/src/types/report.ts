import { paths } from "./confiture-api";

export type AuditReport =
  paths["/reports/{consultUniqueId}"]["get"]["responses"]["200"]["content"]["application/json"];
