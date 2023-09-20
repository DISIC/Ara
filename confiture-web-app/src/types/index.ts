export * from "./types";
export * from "./report";

export interface AuthenticationJwtPayload {
  /** User uid */
  sub: string;
  /** User email */
  email: string;
  /** Issued at */
  iat: number;
  /** Expiration date */
  exp: number;
}

export interface AccountVerificationJwtPayload {
  verification: "new-account";

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

export interface NewEmailVerificationJwtPayload {
  verification: "update-email";

  /** User uid */
  sub: string;

  /** User email.  */
  email: string;

  /**
   * JWT ID
   *
   * At any time, only one verification token should be considered valid. The
   * `jti` property will be compared with the one stored in the DB (User.newEmailVerificationJti) to make sure
   * this is the latest verification token generated.
   */
  jti: string;
}

export type AnyVerificationJwtPayload =
  | AccountVerificationJwtPayload
  | NewEmailVerificationJwtPayload;
