import ky from "ky";

import { Audit } from "../types";

export async function publishAudit(uniqueId: string): Promise<Audit> {
  const response = (await ky
    .put(`/api/audits/${uniqueId}/publish`)
    .json()) as Audit;
  return response;
}
