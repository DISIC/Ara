import { Policy } from "@nestjs/authorization";
import { User } from "../../generated/prisma/client";
import { PrismaService } from "../../prisma.service";

const isAuditInAccount = (audit: { auditor: null | { isVerified: boolean } }): boolean => audit.auditor?.isVerified ?? false;
const isUserAuditOwner = (user: { username: string } | null, audit: { auditorEmail: string | null }): boolean => !!audit.auditorEmail && audit.auditorEmail === user?.username;

@Policy()
export class AuditPolicy {
  constructor(
    private readonly prisma: PrismaService
  ) {}

  create(_user: User | null): boolean {
    // anyone can create an audit
    return true;
  }

  readMany(user: User | null): boolean {
    return !!user && user.isVerified;
  }

  read(_user: User | null): boolean {
    return true;
  }

  update(_user: User | null): boolean {
    return true;
  }

  async delete(user: User | null, auditUniqueId: string): Promise<boolean> {
    const audit = await this.getAudit(auditUniqueId);

    if (isAuditInAccount(audit)) {
      return isUserAuditOwner(user, audit);
    } else {
      return true;
    }
  }

  async transfer(user: User | null, auditUniqueId: string): Promise<boolean> {
    const audit = await this.getAudit(auditUniqueId);

    if (isAuditInAccount(audit)) {
      return isUserAuditOwner(user, audit);
    } else {
      return false;
    }
  }

  // TODO: update this rule
  async duplicate(user: User | null): Promise<boolean> {
    return !!user;
  }

  private getAudit(editUniqueId: string) {
    return this.prisma.audit.findFirstOrThrow({
      where: { editUniqueId, isHidden: false },
      select: {
        auditorEmail: true,
        auditor: { select: { isVerified: true } }
      }
    });
  }
}
