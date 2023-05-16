export * from "./types";
export * from "./report";

export interface AuthenticationJwtPayload {
  /** User email */
  sub: string;
  /** Issued at */
  iat: number;
  /** Expiration date */
  exp: number;
}

export interface AccountVerificationJwtPayload {
  /** User email */
  sub: string;
  /**
   * JWT ID
   *
   * At any time, only one verification token should be considered valid. The
   * `jti` property will be compared with the one stored in the DB to make sure
   * this is the latest verification token generated.
   */
  jti: string;
}
