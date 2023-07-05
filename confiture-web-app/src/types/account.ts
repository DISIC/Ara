import { AuditStatus, AuditType } from "./types";

export interface Account {
  id: string;
  email: string;
  name?: string;
  orgName?: string;
}

export interface UpdateProfileRequestData {
  /** John Doe */
  name?: string;
  /** ACME */
  orgName?: string;
}

export interface AccountDeletionResponse {
  feedbackToken: string;
}

export interface AccountAudit {
  name: string;
  status: AuditStatus.IN_PROGRESS | AuditStatus.COMPLETED;
  creationDate: string;
  type: AuditType;
  complianceLevel: number;
  editId: string;
  consultId: string;
}
