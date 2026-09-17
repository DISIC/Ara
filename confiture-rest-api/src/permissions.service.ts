import assert from "node:assert";
import { ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

@Injectable()
export class PermissionsService {
  constructor(
    private readonly prisma: PrismaService
  ) {}

  /**
   * Checks if duplication is possible
   * - Anyone can delete an orphan audit
   * - If user is not audit owner, throws ForbiddenException (code 403)
   */
  async checkDuplicatePermissions(editUniqueId: string, username: string) {
    const userIsAuditOwner = await this.isAuditOwnedBy(editUniqueId, username);
    const orphan = await this.isAuditOrphan(editUniqueId);

    if (orphan) {
      return;
    }

    if (!userIsAuditOwner) {
      throw new ForbiddenException();
    }
  }

  /**
   * Checks if deletion is possible
   * - Anyone can delete an orphan audit
   * - If user is not connected and audit not orphan, throws UnauthorizedException (code 401)
   * - If user is not audit owner, trows ForbiddenException (code 403)
   */
  async checkDeletePermissions(editUniqueId: string, username?: string): Promise<void> {
    const audit = await this.prisma.audit.findFirst({
      where: { editUniqueId },
      select: {
        isPublic: true,
        auditor: {
          select: {
            username: true,
            isVerified: true
          }
        }
      }
    });

    // Audit is orphan
    if (!audit.auditor.isVerified) {
      assert(audit.isPublic, "Orphan audit should never be private");
      return;
    }

    // User is not connected
    if (!username) {
      throw new UnauthorizedException();
    }

    // User is not audit owner
    if (audit.auditor.username !== username) {
      throw new ForbiddenException();
    }
  }

  /**
   * Checks if transfer is possible
   * - If user is not audit owner, throws ForbiddenException (code 403)
   */
  async checkTransferPermissions(editUniqueId: string, username: string) {
    if (!(await this.isAuditOwnedBy(editUniqueId, username))) {
      throw new ForbiddenException();
    }
  }

  /**
   * Checks if editing audit privacy (public / private) is possible
   * - If user is not audit owner, throws ForbiddenException (code 403)
   */
  async checkEditPrivacyPermissions(editUniqueId: string, username: string) {
    if (!(await this.isAuditOwnedBy(editUniqueId, username))) {
      throw new ForbiddenException();
    }
  }

  /**
   * Check that the user if the audit owner
   */
  private async isAuditOwnedBy(editUniqueId: string, username: string) {
    const audit = await this.prisma.audit.findFirst({
      where: { editUniqueId },
      select: { auditor: { select: { username: true } } }
    });

    return audit.auditor.username === username;
  }

  /**
   * An "orphan audit" is not owned by a verified user
   */
  private async isAuditOrphan(editUniqueId: string): Promise<boolean> {
    const audit = await this.prisma.audit.findFirst({
      where: { editUniqueId },
      select: { isPublic: true, auditor: { select: { username: true, isVerified: true } } }
    });

    assert(audit.isPublic, "Orphan audit should never be private");

    return !audit.auditor.isVerified;
  }
}
