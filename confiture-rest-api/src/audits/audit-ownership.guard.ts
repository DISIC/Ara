import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Request } from "express";
import { AuditService } from "./audit.service";

/**
 * This guard checks if a particular audit can be accessed by the current user.
 *
 * The ID of the audit to check is required to be named `:uniqueId` for this to work.
 * If no param named `:uniqueId` is found, the guard lets the request proceed.
 */
@Injectable()
export class AuditOwnershipGuard implements CanActivate {
  constructor(
    private readonly auditService: AuditService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const username = request.user?.email;
    const auditId = request.params["uniqueId"] as string;

    if (!auditId) {
      return true;
    }

    return this.auditService.validateAuditAccess(auditId, username);
  }
}
