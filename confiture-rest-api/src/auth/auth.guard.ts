import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException
} from "@nestjs/common";

/**
 * Verify that the request is authenticated.
 * This guard requires the `UserMiddleware` to be run on the request.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    if (!request.user) {
      throw new UnauthorizedException();
    }
    return true;
  }
}
