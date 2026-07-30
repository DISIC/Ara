import type { AuthenticationJwtPayload } from "./jwt-payloads";

declare module "express" {
  export interface Request {
    /** UserMiddleware will populate with currently authenticated user if any */
    // FIXME: use user entity instead of payload
    user?: AuthenticationJwtPayload;
  }
}
