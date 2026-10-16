import { Injectable } from "@nestjs/common";
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";
import { isEqual, omit, setWith } from "lodash";
import { nanoid } from "nanoid";
import { CRITERIA_BY_AUDIT_TYPE } from "../../audits/criteria";
import { AuthService } from "../../auth/auth.service";
import { FileStorageService } from "../../file-storage/file-storage.service";
import { CriterionResultStatus, Prisma, User } from "../../generated/prisma/client";
import { PrismaService } from "../../prisma.service";
import { EVENTS } from "../../utils";
import { PagesService, TRANSVERSE_ELEMENTS_SLUG } from "../pages/pages.service";
import { ResultsService } from "../results/results.service";
import { AuditResponseDto } from "./dto/audit-response.dto";
import { CreateAuditRequestDto } from "./dto/create-audit-request.dto";
import { UpdateAuditRequestDto } from "./dto/update-audit-request.dto";

@Injectable()
export class AuditsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pagesService: PagesService,
    private readonly resultsService: ResultsService,
    private readonly eventEmitter: EventEmitter2,
    private readonly authService: AuthService,
    private readonly fileStorageService: FileStorageService
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

    this.eventEmitter.emit(EVENTS.AUDIT_CREATED, { audit, createdBy: user });

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

  async updateAudit(editUniqueId: string, data: UpdateAuditRequestDto): Promise<AuditResponseDto> {
    const previousAudit = await this.prisma.audit.findUniqueOrThrow({
      where: { editUniqueId }
    });

    // Reset org when changing email from unverified to verified user.
    const shouldResetOrganisation =
      data.auditorEmail && previousAudit.auditorEmail &&
      data.auditorEmail !== previousAudit.auditorEmail
            && !(await this.authService.isAccountVerified(previousAudit.auditorEmail))
            && await this.authService.isAccountVerified(data.auditorEmail);

    const audit = await this.prisma.audit.update({
      where: { editUniqueId },
      data: {
        procedureName: data.procedureName,
        auditorName: data.auditorName,
        auditType: data.auditType,
        transverseElements: data.transverseElements,
        ...(data.auditorEmail && {
          auditor: {
            connectOrCreate: {
              create: { username: data.auditorEmail.toLowerCase() },
              where: { username: data.auditorEmail.toLowerCase() }
            }
          }
        }),
        ...(shouldResetOrganisation && { auditorOrganisation: null })
      }
    });

    // update audit edition date only if:
    // - it has a `publicationDate`
    // - transvereElements or type changed
    if (audit.publicationDate && (previousAudit.auditType !== audit.auditType || !isEqual(previousAudit.transverseElements, audit.transverseElements))) {
      const newDates = await this.updateAuditEditDate(editUniqueId);
      Object.assign(audit, newDates);
    }

    // Update statement date when `procedureName` or `pages` change and if there is a `statementPublicationDate`
    if (audit.statementPublicationDate && previousAudit.procedureName !== audit.procedureName) {
      const newDates = await this.updateStatementDate(editUniqueId);
      Object.assign(audit, newDates);
    }

    return audit;
  }

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
  /** When an account is deleted, mark all associated audits as deleted. */
  @OnEvent(EVENTS.ACCOUNT_DELETED)
  async softDeleteAuditsByAuditorEmail(userEmail: string) {
    await this.prisma.audit.updateMany({
      where: {
        auditorEmail: userEmail
      },
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

  async transferAudit(uniqueId: string, newEmail: string, user?: User): Promise<void> {
    // Get original audit email
    const { auditorEmail: originalAuditEmail } = await this.prisma.audit.findUniqueOrThrow({
      where: { editUniqueId: uniqueId },
      select: { auditorEmail: true }
    });

    // Get new owner info
    const newOwner = await this.prisma.user.findUnique({
      where: {
        username: newEmail
      },
      select: {
        name: true
      }
    });

    // Update audit with new owner info if any or reset fields
    const audit = await this.prisma.audit.update({
      where: { editUniqueId: uniqueId },
      data: {
        auditorOrganisation: null,
        auditorName: newOwner?.name ?? null,
        auditor: {
          connectOrCreate: {
            where: { username: newEmail },
            create: {
              username: newEmail
            }
          }
        }
      }
    });

    this.eventEmitter.emit(EVENTS.AUDIT_TRANSFERED, {
      audit: {
        editUniqueId: uniqueId,
        auditorEmail: user?.username || originalAuditEmail,
        auditorName: user?.name,
        procedureName: audit.procedureName
      },
      recipient: newEmail
    });
  }

  /**
   * TODO:
   * - handle sub-resources (pages, notes...) creation: with an event, in one big function...?
   */
  async duplicateAudit(sourceEditUniqueId: string, newProcedureName: string): Promise<AuditResponseDto> {
    const originalAudit = await this.prisma.audit.findFirstOrThrow({
      where: { editUniqueId: sourceEditUniqueId, isHidden: false },
      include: {
        environments: true,
        transverseElementsPage: {
          include: {
            results: {
              include: {
                exampleImages: true,
                notCompliantItems: {
                  select: {
                    id: false,
                    comment: true,
                    quickWin: true,
                    title: true,
                    userImpact: true,
                    criterionResultId: false
                  }
                }
              }
            }
          }
        },
        pages: {
          include: {
            results: {
              include: {
                exampleImages: true,
                notCompliantItems: {
                  select: {
                    id: false,
                    comment: true,
                    quickWin: true,
                    title: true,
                    userImpact: true,
                    criterionResultId: false
                  }
                }
              }
            }
          }
        },
        notesFiles: true
      }
    });

    const duplicateEditUniqueId = nanoid();
    const duplicateConsultUniqueId = nanoid();

    const [imagesCreateData, notesFilesCreateData] = await this.duplicateAuditFiles(sourceEditUniqueId, duplicateEditUniqueId);

    const newAudit = await this.prisma.audit.create({
      data: {
        ...omit(originalAudit, [
          // ignore ids
          "id",
          "auditTraceId",
          "sourceAuditId",
          "transverseElementsPageId",
          "auditorEmail",

          // reset statement fields
          "procedureUrl",
          "initiator",
          "auditorOrganisation",
          "contactName",
          "contactEmail",
          "contactFormUrl",
          "technologies",
          "tools",
          "environments",
          "notCompliantContent",
          "derogatedContent",
          "notInScopeContent"
        ]),

        ...(originalAudit.auditorEmail && {
          auditor: {
            connect: {
              // FIXME: shouldnt the new audit be under the user who duplicated the audit ?
              username: originalAudit.auditorEmail.toLowerCase()
            }
          }
        }),

        // link new audit with the original
        sourceAudit: {
          connect: {
            editUniqueId: sourceEditUniqueId
          }
        },

        editUniqueId: duplicateEditUniqueId,
        consultUniqueId: duplicateConsultUniqueId,

        procedureName: newProcedureName,

        creationDate: new Date(),
        editionDate: undefined,
        publicationDate: originalAudit.publicationDate ? new Date() : undefined,
        statementPublicationDate: undefined,
        statementEditionDate: undefined,

        environments: {
          createMany: {
            data: originalAudit.environments.map((e) =>
              omit(e, ["id", "auditUniqueId"])
            )
          }
        },

        transverseElementsPage: {
          create: {
            ...omit(originalAudit.transverseElementsPage, ["id"]),
            results: {
              create: originalAudit.transverseElementsPage.results.map((r) => ({
                ...omit(r, ["id", "pageId"]),
                exampleImages: {
                  create: r.exampleImages.map(
                    (e) =>
                      imagesCreateData[originalAudit.transverseElementsPage.id][
                        r.id
                      ][e.id]
                  )

                },
                notCompliantItems: {
                  create: r.notCompliantItems.map((item) => ({ ...omit(item, ["id"]) }))
                }
              }))
            }
          }
        },

        pages: {
          create: originalAudit.pages.map((p) => ({
            name: p.name,
            url: p.url,
            order: p.order,
            slug: p.slug,
            results: {
              create: p.results.map((r) => ({
                ...omit(r, ["id", "pageId"]),
                exampleImages: {
                  create: r.exampleImages.map(
                    (e) => imagesCreateData[p.id][r.id][e.id]
                  )
                },
                notCompliantItems: {
                  create: r.notCompliantItems.map((item) => ({ ...omit(item, ["id"]) }))
                }
              }))
            }
          }))
        },

        notesFiles: {
          create: notesFilesCreateData
        },

        auditTrace: {
          create: {
            auditConsultUniqueId: duplicateConsultUniqueId,
            auditEditUniqueId: duplicateEditUniqueId
          }
        }
      }
    });

    return newAudit;
  }

  /** Duplicate files  */
  private async duplicateAuditFiles(
    sourceEditUniqueId: string,
    destinationEditUniqueId: string
  ): Promise<[
    { [pageId: string]: {
      [resultId: string]: Prisma.ExampleImageFileCreateInput;
    }; },
    Prisma.NotesFileCreateWithoutAuditInput[]
  ]> {
    const sourceAudit = await this.prisma.audit.findFirstOrThrow({
      where: { editUniqueId: sourceEditUniqueId, isHidden: false },
      select: {
        pages: {
          select: {
            id: true,
            results: {
              select: {
                id: true,
                exampleImages: true
              }
            }
          }
        },
        transverseElementsPage: {
          select: {
            id: true,
            results: {
              select: {
                id: true,
                exampleImages: true
              }
            }
          }
        },
        notesFiles: true
      }
    });

    // record of expampleImage creation data mapped by `page id -> result id -> example id`
    const imagesCreateData: {
      [pageId: string]: {
        [resultId: string]: Prisma.ExampleImageFileCreateInput;
      };
    } = {};

    // Array storing duplicate notesFiles creation data
    const notesFilesCreateData: Prisma.NotesFileCreateWithoutAuditInput[] = [];

    // contains s3 file duplications which will be executed together by calling
    // `fileStorageService.duplicateMultipleFiles()`
    const fileDuplications: { originalKey: string; destinationKey: string }[] = [];

    [...sourceAudit.pages, sourceAudit.transverseElementsPage].forEach((p) => {
      p.results.forEach((r) => {
        r.exampleImages.forEach((e) => {
          const randomPrefix = nanoid();

          const key = `audits/${destinationEditUniqueId}/${randomPrefix}/${e.originalFilename}`;
          const thumbnailKey = `audits/${destinationEditUniqueId}/${randomPrefix}/thumbnail_${e.originalFilename}`;

          fileDuplications.push(
            {
              originalKey: e.key,
              destinationKey: key
            },
            {
              originalKey: e.thumbnailKey,
              destinationKey: thumbnailKey
            }
          );

          setWith(
            imagesCreateData,
            [p.id, r.id, e.id],
            {
              originalFilename: e.originalFilename,
              mimetype: e.mimetype,
              size: e.size,
              key: key,
              thumbnailKey: thumbnailKey
            },
            Object
          );
        });
      });
    });

    sourceAudit.notesFiles.forEach((e) => {
      const randomPrefix = nanoid();

      // No thumbnail? It means there is no image as well!
      const hasThumbnail = e.thumbnailKey !== null;

      const key = `audits/${destinationEditUniqueId}/${randomPrefix}/${e.originalFilename}`;

      const thumbnailKey = hasThumbnail
        ? `audits/${destinationEditUniqueId}/${randomPrefix}/thumbnail_${e.originalFilename}`
        : null;

      if (e.thumbnailKey !== null && thumbnailKey) {
        fileDuplications.push({
          originalKey: e.thumbnailKey,
          destinationKey: thumbnailKey
        });
      }

      fileDuplications.push({
        originalKey: e.key,
        destinationKey: key
      });

      notesFilesCreateData.push({
        originalFilename: e.originalFilename,
        mimetype: e.mimetype,
        size: e.size,
        key: key,
        thumbnailKey: thumbnailKey
      });
    });

    await this.fileStorageService.duplicateMultipleFiles(fileDuplications);

    return [imagesCreateData, notesFilesCreateData];
  }

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

  /**
   * Erase an audit publicationDate & editionDate, only if the audit is no longer marked
   * as completed after having been completed or
   * Update an audit editionDate, only when it has a publication date.
   * @returns the new publication and edition dates if they are updated, undefined otherwise
   */
  private async updateAuditEditDate(uniqueId: string): Promise<{ publicationDate: Date | null; editionDate: Date | null } | undefined> {
    const [audit, auditIsComplete] = await Promise.all([
      this.prisma.audit.findUniqueOrThrow({
        where: {
          editUniqueId: uniqueId
        },
        select: {
          publicationDate: true
        }
      }),
      this.isAuditComplete(uniqueId)
    ]);

    if (audit.publicationDate && !auditIsComplete) {
      return this.prisma.audit.update({
        where: { editUniqueId: uniqueId },
        data: { publicationDate: null, editionDate: null },
        select: {
          publicationDate: true,
          editionDate: true
        }
      });
    }

    if (audit.publicationDate) {
      return this.prisma.audit.update({
        where: { editUniqueId: uniqueId },
        data: { editionDate: new Date() },
        select: {
          publicationDate: true,
          editionDate: true
        }
      });
    }
  }

  // Either update statement publication or edition date
  private async updateStatementDate(uniqueId: string): Promise<{ statementEditionDate: Date | null; statementPublicationDate: Date | null }> {
    const audit = await this.prisma.audit.findUniqueOrThrow({
      where: { editUniqueId: uniqueId },
      select: { statementPublicationDate: true }
    });

    return this.prisma.audit.update({
      where: { editUniqueId: uniqueId },
      data: audit.statementPublicationDate
        ? { statementEditionDate: new Date() }
        : { statementPublicationDate: new Date() },
      select: { statementEditionDate: true, statementPublicationDate: true }
    });
  }

  private async isAuditComplete(uniqueId: string): Promise<boolean> {
    const audit = await this.prisma.audit.findUniqueOrThrow({
      where: { editUniqueId: uniqueId },
      include: {
        pages: true
      }
    });

    const testedCount = await this.prisma.criterionResult.count({
      where: {
        page: {
          auditUniqueId: uniqueId
        },
        status: {
          not: CriterionResultStatus.NOT_TESTED
        },
        OR: CRITERIA_BY_AUDIT_TYPE[audit.auditType]
      }
    });

    const expectedCount =
      CRITERIA_BY_AUDIT_TYPE[audit.auditType].length * audit.pages.length;

    return testedCount === expectedCount;
  }
}
