import { Injectable, PipeTransform, ArgumentMetadata, GoneException, NotFoundException } from "@nestjs/common";
import { AuditService } from "./audit.service";

/**
 * Asynchronously checks that the audit associated with the given editUniqueId exists.
 * If it does not, return a 404 or 410 status.
 */
@Injectable()
export class AuditExistsPipe implements PipeTransform {
  constructor(
    private readonly auditService: AuditService
  ) { }

  async transform(value: string, _metadata: ArgumentMetadata) {
    const exists = await this.auditService.checkIfAuditExists(value);
    if (!exists) {
      await this.sendAuditNotFoundStatus(value);
    }
    return value;
  }

  /**
   * Send 404 (Not Found) status for audits that never existed
   * and 410 (Gone) for audits that existed but were deleted.
   */
  private async sendAuditNotFoundStatus(editUniqueId: string) {
    if (await this.auditService.checkIfAuditWasDeleted(editUniqueId)) {
      throw new GoneException();
    } else {
      throw new NotFoundException();
    }
  }
}
