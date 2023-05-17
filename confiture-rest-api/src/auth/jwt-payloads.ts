export interface AuthenticationJwtPayload {
  /** User uid */
  sub: string;

  /** User email */
  email: string;
}

export interface AccountVerificationJwtPayload {
  /** User uid */
  sub: string;

  /** User email */
  email: string;

  /**
   * JWT ID
   *
   * At any time, only one verification token should be considered valid. The
   * `jti` property will be compared with the one stored in the DB to make sure
   * this is the latest verification token generated.
   */
  jti: string;
}
