import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";

/**
 * Verify that the request is authenticated.
 * This guard requires the `UserMiddleware` to be run on the request.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    return !!request.user;
  }
}
