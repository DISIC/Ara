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
