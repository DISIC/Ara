import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma.service";
import { AuditResponseDto } from "./dto/audit-response.dto";

@Injectable()
export class AuditsService {
  constructor(
    private readonly prisma: PrismaService
  ) {}

  //
  // CRUD methods
  //

  async createAudit(): Promise<AuditResponseDto> { throw "todo"; }
  async getAudits(): Promise<AuditResponseDto[]> { throw "todo"; }

  async getAudit(editUniqueId: string): Promise<AuditResponseDto> {
    return this.prisma.audit.findFirstOrThrow({
      where: { editUniqueId, isHidden: false }
    });
  }

  async updateAudit(): Promise<AuditResponseDto> { throw "todo"; }

  async softDeleteAudit(editUniqueId: string): Promise<void> {
    await this.prisma.audit.update({
      where: { editUniqueId },
      data: {
        isHidden: true,
        auditorEmail: null,
        auditorName: null,
        auditorOrganisation: null
      }
    });
  }

  //
  // action methods
  //

  async transferAudit(): Promise<void> { throw "todo"; }
  async duplicateAudit(): Promise<AuditResponseDto> { throw "todo"; }

  //
  // utils methods
  //

  async hasBeenDeleted(editUniqueId: string): Promise<boolean> {
    const audit = await this.prisma.audit.findFirst({
      where: { editUniqueId, isHidden: true },
      select: { id: true }
    });
    return !!audit;
  }
}
