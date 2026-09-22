import assert from "node:assert";
import { ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

// Definitions
// - Orphan audit: a public audit not owned by a verified user

@Injectable()
export class PermissionsService {
  constructor(
    private readonly prisma: PrismaService
  ) { }

  /**
   * Check audit privacy and ownership if user is connected
   *
   * @param editUniqueId id of the audit to check ownership of
   * @param username email adress of user
   * @returns if the audit is accessible by the user
   * @throws if the audit is not acessible by the user
   */
  async checkAuditAccess(editUniqueId: string, username?: string): Promise<void> {
    const audit = await this.prisma.audit.findFirst({
      where: { editUniqueId },
      select: { procedureName: true, isPublic: true, auditor: { select: { username: true } } }
    });

    if (!(audit.isPublic || (username && audit.auditor.username === username))) {
      throw new ForbiddenException({ auditName: audit.procedureName });
    }
  }

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
      // throws if `audit.isPublic` is false
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
      select: { isPublic: true, auditor: { select: { isVerified: true } } }
    });

    // throws if `audit.isPublic` is false
    assert(audit.isPublic, "Orphan audit should never be private");

    return !audit.auditor.isVerified;
  }
}
