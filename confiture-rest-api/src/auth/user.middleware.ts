import type { Request } from "express";
import { Injectable, NestMiddleware } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AuthService } from "./auth.service";
import { AuthenticationJwtPayload } from "./jwt-payloads";

/**
 * Extract the authentication token and verifies it.
 * No error is thrown if there is no token or if the token is invalid. Use the
 * AuthRequired decorator if you want a route to only accept authenticated requests.
 */
@Injectable()
export class UserMiddleware implements NestMiddleware {
  constructor(private readonly jwt: JwtService, private readonly authService: AuthService) {}

  use(req: Request, res: any, next: (error?: any) => void) {
    const token = this.extractTokenFromHeader(req);

    if (!token) {
      next();
      return;
    }

    this.jwt
      .verifyAsync<AuthenticationJwtPayload>(token)
      .then((payload) => {
        this.authService.getUserByUid(payload.sub).then(user => {
          req.user = user;
          next();
        }).catch(next);
      })
      .catch(next);
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }
}
