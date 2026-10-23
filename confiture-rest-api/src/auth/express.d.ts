import { User } from "../generated/prisma/client";

declare module "express" {
  export interface Request {
    /** Used by the AuthGuard and UserDecorator to store current user */
    user?: User;
  }
}
