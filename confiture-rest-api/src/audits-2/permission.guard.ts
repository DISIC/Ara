import { CanActivate, ExecutionContext } from "@nestjs/common";
import { Request } from "express";
import { Observable } from "rxjs";

export class PermissionGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest<Request>();

    if (!isAuditRequest(req)) {
      return true;
    }

    // TODO: check authorization here
    return true;
  }
}

function isAuditRequest(req: Request): boolean {
  return !!req.params.uniqueId;
}
