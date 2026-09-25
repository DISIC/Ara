import { Injectable } from "@nestjs/common";
import { nanoid } from "nanoid";
import { AuditType } from "../../generated/prisma/enums";
import { PrismaService } from "../../prisma.service";
import { PagesService, TRANSVERSE_ELEMENTS_SLUG } from "../pages/pages.service";
import { AuditResponseDto } from "./dto/audit-response.dto";
import { CreateAuditRequestDto } from "./dto/create-audit-request.dto";

@Injectable()
export class AuditsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pagesService: PagesService
  ) {}

  //
  // CRUD methods
  //

  async createAudit(data: CreateAuditRequestDto): Promise<AuditResponseDto> {
    // simplified implementation for demonstration purpose
    const editUniqueId = nanoid();
    const consultUniqueId = nanoid();

    const audit = await this.prisma.audit.create({
      data: {
        editUniqueId,
        consultUniqueId,
        auditType: AuditType.FULL,
        procedureName: data.procedureName,
        auditTrace: {
          create: {
            auditConsultUniqueId: consultUniqueId,
            auditEditUniqueId: editUniqueId
          }
        },
        transverseElementsPage: {
          create: {
            name: "Éléments transverses",
            slug: TRANSVERSE_ELEMENTS_SLUG,
            url: "",
            order: -1
          }
        }
      }
    });

    if (data.pages) {
      await this.pagesService.createPages(audit.editUniqueId, data.pages);
    }

    return audit;
  }

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
