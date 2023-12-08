import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { AuthenticationJwtPayload } from './jwt-payloads';

/**
 * Verify that the request is authenticated.
 * This guard requires the `UserMiddleware` to be run on the request.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    return !!request.user
  }
}
