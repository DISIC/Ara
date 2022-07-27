import ky from "ky";

export interface CreateAuditData {
  procedure: string;
  procedureUrl: string;

  initiator: string;

  contactName?: string;
  contactEmail: string;
  contactFormUrl: string;

  recipients: Array<{
    name: string;
    email: string;
  }>;

  auditorName: string;
  auditorEmail: string;
}

interface CreateAuditResponse {
  id: number;
  editUniqueId: string;
  consultUniqueId: string;
  initiator: string;
  procedure: string;
  url: string;
  contactName: string | null;
  contactEmail: string;
  contactFormUrl: string;
  auditorName: string;
  auditorEmail: string;
  recipients: Array<{
    id: number;
    name: string;
    email: string;
  }>;
}

export async function createAudit(
  data: CreateAuditData
): Promise<CreateAuditResponse> {
  const response = (await ky
    .post("/api/audits", {
      json: data,
    })
    .json()) as CreateAuditResponse;
  return response;
}
