import ky from "ky";
import { Audit, UpdateAuditRequestData } from "../types";

export async function updateAudit(
  uniqueId: string,
  data: UpdateAuditRequestData
): Promise<Audit> {
  const response = (await ky
    .put(`/api/audits/${uniqueId}`, {
      json: data,
    })
    .json()) as Audit;
  return response;
}
