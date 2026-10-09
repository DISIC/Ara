import { Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { nanoid } from "nanoid";
import { User } from "../../generated/prisma/client";
import { PrismaService } from "../../prisma.service";
import { PagesService, TRANSVERSE_ELEMENTS_SLUG } from "../pages/pages.service";
import { ResultsService } from "../results/results.service";
import { AuditResponseDto } from "./dto/audit-response.dto";
import { CreateAuditRequestDto } from "./dto/create-audit-request.dto";

@Injectable()
export class AuditsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pagesService: PagesService,
    private readonly resultsService: ResultsService,
    private readonly eventEmitter: EventEmitter2
  ) {}

  //
  // CRUD methods
  //

  async createAudit(data: CreateAuditRequestDto, user?: User): Promise<AuditResponseDto> {
    const editUniqueId = nanoid();
    const consultUniqueId = nanoid();

    const audit = await this.prisma.audit.create({
      data: {
        editUniqueId,
        consultUniqueId,
        creationDate: new Date(),
        procedureName: data.procedureName,
        auditType: data.auditType,
        auditor: {
          connectOrCreate: {
            create: {
              username: data.auditorEmail.toLowerCase()
            },
            where: {
              username: data.auditorEmail.toLowerCase()
            }
          }
        },
        auditorName: data.auditorName,
        transverseElementsPage: {
          create: {
            name: "Éléments transverses",
            slug: TRANSVERSE_ELEMENTS_SLUG,
            url: "",
            order: -1
          }
        },
        auditTrace: {
          create: {
            auditConsultUniqueId: consultUniqueId,
            auditEditUniqueId: editUniqueId
          }
        }
      }
    });

    if (data.pages) {
      await this.pagesService.createPages(audit.editUniqueId, data.pages);
    }

    // TODO: prefill results
    const topicNumbers = [
      ...(data.pageElements.frame ? [] : [2]),
      ...(data.pageElements.multimedia ? [] : [4]),
      ...(data.pageElements.table ? [] : [5]),
      ...(data.pageElements.form ? [] : [11])
    ];
    await this.resultsService.prefillNotApplicableTopics(editUniqueId, topicNumbers);

    this.eventEmitter.emit("audit.created", { audit, createdBy: user });

    return audit;
  }

  async getAudits(auditorEmail: string): Promise<AuditResponseDto[]> {
    return await this.prisma.audit.findMany({
      where: {
        auditorEmail,
        isHidden: false
      }
    });
  }

  async getAudit(editUniqueId: string): Promise<AuditResponseDto> {
    return this.prisma.audit.findFirstOrThrow({
      where: { editUniqueId, isHidden: false }
    });
  }

  async updateAudit(): Promise<AuditResponseDto> { throw "todo"; }

  /**
   * Mark an audit as deleted and anonymise auditor informations. Its data will not be deleted.
   */
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
