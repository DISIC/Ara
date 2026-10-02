import { AuthorizationService } from "@nestjs/authorization";
import { Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { nanoid } from "nanoid";
import { User } from "../../generated/prisma/client";
import { AuditType } from "../../generated/prisma/enums";
import { PrismaService } from "../../prisma.service";
import { PagesService, TRANSVERSE_ELEMENTS_SLUG } from "../pages/pages.service";
import { AuditPolicy } from "./audit.policy";
import { AuditResponseDto } from "./dto/audit-response.dto";
import { CreateAuditRequestDto } from "./dto/create-audit-request.dto";

@Injectable()
export class AuditsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pagesService: PagesService,
    private readonly eventEmitter: EventEmitter2,
    private readonly authorization: AuthorizationService
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
        auditor: {
          connectOrCreate: {
            create: {
              username: "adrien@slash-tmp.dev"
            },
            where: {
              username: "adrien@slash-tmp.dev"
            }
          }
        },
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

    this.eventEmitter.emit("audit.created", audit);

    return audit;
  }

  async getAudits(): Promise<AuditResponseDto[]> { throw "todo"; }

  async getAudit(editUniqueId: string): Promise<AuditResponseDto> {
    return this.prisma.audit.findFirstOrThrow({
      where: { editUniqueId, isHidden: false }
    });
  }

  async updateAudit(): Promise<AuditResponseDto> { throw "todo"; }

  async softDeleteAudit(editUniqueId: string, user: User | null): Promise<void> {
    await this.authorization.authorize(AuditPolicy, "delete", user, editUniqueId);
    // await this.prisma.audit.update({
    //   where: { editUniqueId },
    //   data: {
    //     isHidden: true,
    //     auditorEmail: null,
    //     auditorName: null,
    //     auditorOrganisation: null
    //   }
    // });
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
