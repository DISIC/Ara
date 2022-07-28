import ky from "ky";
import { Audit, CreateAuditRequestData } from "../types";

export async function createAudit(
  data: CreateAuditRequestData
): Promise<Audit> {
  const response = (await ky
    .post("/api/audits", {
      json: data,
    })
    .json()) as Audit;
  return response;
}
