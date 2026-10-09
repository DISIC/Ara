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

  async read(user: User | null, auditUniqueId: string): Promise<boolean> {
    console.log(`checking read permission on audit ${auditUniqueId}`);
    const audit = await this.getAudit(auditUniqueId);

    if (isAuditInAccount(audit)) {
      return isUserAuditOwner(user, audit);
    } else {
      // @ts-expect-error `isPublic` does not exist yet on audit
      return audit.isPublic;
    }
  }

  create(_user: User | null) {
    return true;
  }

  update(_user: User | null) {
    return true;
  }

  async delete(user: User | null, auditUniqueId: string): Promise<boolean> {
    const audit = await this.getAudit(auditUniqueId);

    if (isAuditInAccount(audit)) {
      return isUserAuditOwner(user, audit);
    } else {
      // @ts-expect-error `isPublic` does not exist yet on audit
      return audit.isPublic;
    }
  }

  private getAudit(editUniqueId: string) {
    return this.prisma.audit.findFirstOrThrow({
      where: { editUniqueId, isHidden: false },
      select: {
        auditorEmail: true,
        // isPublic: true,
        auditor: { select: { isVerified: true } }
      }
    });
  }
}
