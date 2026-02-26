import { Injectable } from "@nestjs/common";
import _, { isEqual, omit, orderBy, partition, pick, setWith, sortBy, uniqBy } from "lodash";
import { nanoid } from "nanoid";
import sharp from "sharp";
import {
  Audit,
  AuditType,
  CriterionResult,
  CriterionResultStatus,
  CriterionResultUserImpact,
  Prisma
} from "../generated/prisma/client";

import { PrismaService } from "../prisma.service";
import * as RGAA from "../rgaa.json";
import { slugify } from "../utils";
import { CRITERIA_BY_AUDIT_TYPE } from "./criteria";
import { AuditListingItemDto } from "./dto/audit-listing-item.dto";
import { AuditReportDto } from "./dto/audit-report.dto";
import { AuditDto } from "./dto/entities/audit.dto";
import { CriterionResultDto } from "./dto/entities/criterion-result.dto";
import { GetPageWithResultsDto } from "./dto/get-page-with-results.dto";
import { CreateAuditDto } from "./dto/requests/create-audit.dto";
import { PatchAuditDto } from "./dto/requests/patch-audit.dto";
import { UpdateAuditDto } from "./dto/requests/update-audit.dto";
import { UpdateResultsDto } from "./dto/requests/update-results.dto";
import { UpdateStatementDto } from "./dto/requests/update-statement.dto";
import { FileStorageService } from "./file-storage.service";
import { AUDIT_PRISMA_SELECT } from "./prisma-selects";

const AUDIT_EDIT_INCLUDE = {
  recipients: true,
  environments: true,
  transverseElementsPage: true,
  pages: true,
  sourceAudit: {
    select: {
      procedureName: true
    }
  },
  notesFiles: true
} as const;

const isCompliant = (c: CriterionResult) =>
  c.status === CriterionResultStatus.COMPLIANT;

const isNotCompliant = (c: CriterionResult) =>
  c.status === CriterionResultStatus.NOT_COMPLIANT;

const isNotApplicable = (c: CriterionResult) =>
  c.status === CriterionResultStatus.NOT_APPLICABLE;

const isNotTested = (c: CriterionResult) =>
  c.status === CriterionResultStatus.NOT_TESTED;

const isTransverse = (c: CriterionResult, transversePageId: number) =>
  c.pageId === transversePageId;

const TRANSVERSE_ELEMENTS_SLUG: string = "elements-transverses";

@Injectable()
export class AuditService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileStorageService: FileStorageService
  ) {}

  async createAudit(data: CreateAuditDto): Promise<AuditDto> {
    const editUniqueId = nanoid();
    const consultUniqueId = nanoid();

    const pagesWithSlug = this.generatePageSlugs(data.pages);

    const newAudit = await this.prisma.audit.create({
      data: {
        editUniqueId,
        consultUniqueId,

        creationDate: new Date(),

        procedureName: data.procedureName,

        auditType: data.auditType,

        auditorEmail: data.auditorEmail,
        auditorName: data.auditorName,

        transverseElementsPage: {
          create: {
            name: "Éléments transverses",
            slug: TRANSVERSE_ELEMENTS_SLUG,
            url: "",
            order: -1
          }
        },
        pages: {
          createMany: {
            data: pagesWithSlug.map((p, i) => {
              return { ...p, order: i };
            })
          }
        },

        auditTrace: {
          create: {
            auditConsultUniqueId: consultUniqueId,
            auditEditUniqueId: editUniqueId
          }
        }
      },
      select: AUDIT_PRISMA_SELECT
    });

    if (Object.values(data.pageElements).every((el) => el)) {
      return newAudit;
    }

    /* Prefill not applicable results */
    const pageIds = [
      newAudit.transverseElementsPageId,
      ...newAudit.pages.map((p) => p.id)
    ];
    const topicNumbers = [
      ...(data.pageElements.frame ? [] : [2]),
      ...(data.pageElements.multimedia ? [] : [4]),
      ...(data.pageElements.table ? [] : [5]),
      ...(data.pageElements.form ? [] : [11])
    ];
    const criteria = CRITERIA_BY_AUDIT_TYPE[newAudit.auditType].filter(
      ({ topic }) => topicNumbers.includes(topic)
    );

    const results = pageIds.flatMap((pageId) =>
      criteria.map(({ topic, criterium }) => ({
        pageId,
        criterium,
        topic,
        status: CriterionResultStatus.NOT_APPLICABLE
      }))
    );

    await this.prisma.criterionResult.createMany({
      data: results
    });

    return newAudit;
  }

  /**
   * Generate unique slugs for an array of pages.
   *
   * `transverse-elements` is reserved, slugs that would conflict with this name will be appended
   *
   * @param pages An array of objects containing a name property
   * @returns An shallow copy of the `pages` array with added `slug` property that is guaranteed to be unique within that array
   */
  private generatePageSlugs<T extends { name: string }>(pages: T[]): (T & { slug: string })[] {
    const existingSlugs = new Set<string>([TRANSVERSE_ELEMENTS_SLUG]);
    const pagesWithSlug = pages.map(page => {
      let slug = slugify(page.name);
      for (let i = 1; ;i++) {
        if (!existingSlugs.has(slug)) {
          break;
        }
        slug = `${slugify(page.name)}-${i}`;
      }
      existingSlugs.add(slug);
      return { ...page, slug };
    });
    return pagesWithSlug;
  }

  findAuditWithEditUniqueId(uniqueId: string, include?: Prisma.AuditInclude) {
    return this.prisma.audit.findFirst({
      where: { editUniqueId: uniqueId, isHidden: false },
      include
    });
  }

  getAuditWithEditUniqueId(uniqueId: string) {
    return this.prisma.audit.findUnique({
      where: { editUniqueId: uniqueId },
      include: {
        recipients: true,
        environments: true,
        pages: true,
        sourceAudit: {
          select: {
            procedureName: true
          }
        },
        notesFiles: true
      }
    });
  }

  getAuditWithConsultUniqueId(uniqueId: string) {
    return this.prisma.audit.findUnique({
      where: { consultUniqueId: uniqueId },
      include: {
        recipients: true,
        environments: true,
        pages: true,
        sourceAudit: {
          select: {
            procedureName: true
          }
        }
      }
    });
  }

  async getResultsWithEditUniqueId(
    uniqueId: string
  ): Promise<
    CriterionResultDto[]
  > {
    const [audit, pages, results, transverseResults] = await Promise.all([
      this.prisma.audit.findUnique({
        include: {
          transverseElementsPage: true
        },
        where: {
          editUniqueId: uniqueId
        }
      }),
      this.prisma.auditedPage.findMany({
        where: { auditUniqueId: uniqueId }
      }),
      this.prisma.criterionResult.findMany({
        where: {
          page: {
            audit: {
              editUniqueId: uniqueId
            }
          }
        },
        include: {
          exampleImages: true
        }
      }),
      this.prisma.criterionResult.findMany({
        where: {
          page: {
            auditTransverse: {
              editUniqueId: uniqueId
            }
          }
        },
        include: {
          exampleImages: true
        }
      })
    ]);
    const existingResults = [...results, ...transverseResults];

    // We do not create every empty criterion result rows in the db when creating pages.
    // Instead we return the results in the database and fill missing criteria with placeholder data.
    return [audit.transverseElementsPage, ...pages].flatMap((page) =>
      this.getResultsWithPlaceholders(page.id, audit.auditType, existingResults)
    );
  }

  /**
   * Returns an array of results so that even if some are missing in the
   * database, we get all 106 criteria in the result array
   * (or 25, or 50, depending on the audit type).
   *
   * For example, if we have only 3 results in db :
   * ```
   * [r1, r2, r4] -> [r1, r2, r3 (filler), r4, r5 (filler), ..., r106 (filler)]
   * ```
   */
  private getResultsWithPlaceholders(pageId: number, auditType: AuditType, existingResults: CriterionResultDto[]): CriterionResultDto[] {
    return CRITERIA_BY_AUDIT_TYPE[auditType].map((criterion) => {
      const existingResult = existingResults.find(
        (result) =>
          result.pageId === pageId &&
          result.topic === criterion.topic &&
          result.criterium == criterion.criterium
      );

      // return real result
      if (existingResult) return existingResult;

      // return placeholder result
      return {
        status: CriterionResultStatus.NOT_TESTED,
        compliantComment: null,
        notCompliantComment: null,
        userImpact: null,
        notApplicableComment: null,
        exampleImages: [],
        quickWin: false,

        topic: criterion.topic,
        criterium: criterion.criterium,
        pageId: pageId
      };
    });
  }

  async getPageWithResults(uniqueId: string, pageSlug: string): Promise<GetPageWithResultsDto | null> {
    const [audit, page] = await Promise.all([
      // fetch audit type
      this.prisma.audit.findUnique({
        where: { editUniqueId: uniqueId },
        select: { auditType: true }
      }),
      // fetch page with associated results
      this.prisma.auditedPage.findFirst({
        where: {
          OR: [
            // search for normal pages
            {
              auditUniqueId: uniqueId
            },
            // search for transverse page
            {
              auditTransverse: {
                editUniqueId: uniqueId
              }
            }
          ],
          slug: pageSlug
        },
        select: {
          id: true,
          name: true,
          results: {
            select: {
              status: true,
              compliantComment: true,
              notCompliantComment: true,
              userImpact: true,
              notApplicableComment: true,
              exampleImages: {
                select: {
                  id: true,
                  originalFilename: true,
                  mimetype: true,
                  size: true,
                  key: true,
                  thumbnailKey: true
                }
              },
              quickWin: true,

              topic: true,
              criterium: true,
              pageId: true
            }
          }
        }
      })
    ]);

    if (!audit || !page) {
      return null;
    }

    // add placeholder results
    page.results = this.getResultsWithPlaceholders(page.id, audit.auditType, page.results);

    return page;
  }

  async updateAudit(
    uniqueId: string,
    data: UpdateAuditDto
  ): Promise<AuditDto | undefined> {
    try {
      const orderedPages = data.pages.map((p, i) => ({ ...p, order: i }));
      const pagesWithSlugs = this.generatePageSlugs(orderedPages);
      const updatedPages = pagesWithSlugs.filter((p) => p.id);
      const newPages = pagesWithSlugs.filter((p) => !p.id);

      const previousAudit = await this.prisma.audit.findUnique({
        where: {
          editUniqueId: uniqueId
        },
        include: AUDIT_EDIT_INCLUDE
      });

      const audit = await this.prisma.audit.update({
        where: { editUniqueId: uniqueId },
        data: {
          procedureName: data.procedureName,
          procedureUrl: data.procedureUrl,

          initiator: data.initiator,

          auditorEmail: data.auditorEmail,
          auditorName: data.auditorName,
          auditorOrganisation: data.auditorOrganisation,

          contactName: data.contactName,
          contactEmail: data.contactEmail,
          contactFormUrl: data.contactFormUrl,

          technologies: data.technologies,

          tools: data.tools,

          auditType: data.auditType,

          environments: {
            deleteMany: {
              OR: [
                {
                  platform: {
                    notIn: data.environments.map((e) => e.platform)
                  }
                },
                {
                  operatingSystem: {
                    notIn: data.environments.map((e) => e.operatingSystem)
                  }
                },
                {
                  assistiveTechnology: {
                    notIn: data.environments.map((e) => e.assistiveTechnology)
                  }
                },
                {
                  browser: {
                    notIn: data.environments.map((e) => e.browser)
                  }
                }
              ]
            },
            upsert: data.environments.map((environment) => ({
              where: {
                platform_operatingSystem_assistiveTechnology_browser_auditUniqueId:
                    {
                      auditUniqueId: uniqueId,
                      platform: environment.platform,
                      operatingSystem: environment.operatingSystem,
                      assistiveTechnology: environment.assistiveTechnology,
                      browser: environment.browser
                    }
              },
              create: environment,
              update: environment
            }))
          },
          pages: {
            deleteMany: {
              id: {
                notIn: updatedPages.map((p) => p.id)
              }
            },
            update: updatedPages.map((p) => ({
              where: { id: p.id },
              data: {
                order: p.order,
                name: p.name,
                url: p.url,
                slug: p.slug
              }
            })),
            createMany: {
              data: newPages.map((p) => ({
                order: p.order,
                name: p.name,
                url: p.url,
                slug: p.slug
              }))
            }
          },
          notCompliantContent: data.notCompliantContent,
          derogatedContent: data.derogatedContent,
          notInScopeContent: data.notInScopeContent,
          notes: data.notes,
          transverseElements: data.transverseElements
        },
        select: AUDIT_PRISMA_SELECT
      });

      // check the diffenences between the audit after and before the update
      const changedProperties: (keyof typeof audit)[] =
        _
          .differenceWith(Object.entries(audit), Object.entries(previousAudit), _.isEqual)
          .map(entries => entries[0] as keyof typeof audit);

      // update audit edition date only if a property other than below has been changed
      const ignoredChanges: (keyof typeof audit)[] = ["auditorName", "procedureName", "auditorEmail"];
      if (!changedProperties.every(changedProperty => ignoredChanges.includes(changedProperty))) {
        await this.updateAuditEditDate(uniqueId);
      }

      // Update statement date when `procedureName` or `pages` change and if there is a `statementPublicationDate`
      if (
        audit.statementPublicationDate &&
        (
          !isEqual(previousAudit.pages, audit.pages ||
          changedProperties.includes("procedureName"))
        )
      ) {
        return (await this.updateStatementDate(uniqueId)) ?? audit;
      }

      return audit;
    } catch (e) {
      // Audit does not exist
      // https://www.prisma.io/docs/reference/api-reference/error-reference#p2025
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e?.code === "P2025"
      ) {
        return;
      }
      throw e;
    }
  }

  async patchAudit(
    uniqueId: string,
    data: PatchAuditDto
  ): Promise<Audit | undefined> {
    try {
      const audit = await this.prisma.audit.update({
        where: { editUniqueId: uniqueId },
        data: { notes: data.notes, editionDate: new Date() }
      });

      return audit;
    } catch (e) {
      // Audit does not exist
      // https://www.prisma.io/docs/reference/api-reference/error-reference#p2025
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e?.code === "P2025"
      ) {
        return;
      }
      throw e;
    }
  }

  async updateResults(uniqueId: string, body: UpdateResultsDto) {
    const promises = body.data
      .map((item) => {
        const data: Prisma.CriterionResultUpsertArgs["create"] = {
          criterium: item.criterium,
          topic: item.topic,
          page: {
            connect: {
              id: item.pageId
            }
          },

          status: item.status,
          compliantComment: item.compliantComment,
          notCompliantComment: item.notCompliantComment,
          notApplicableComment: item.notApplicableComment,
          userImpact: item.userImpact,
          quickWin: item.quickWin
        };

        const result = [
          this.prisma.criterionResult.upsert({
            where: {
              pageId_topic_criterium: {
                criterium: item.criterium,
                topic: item.topic,
                pageId: item.pageId
              }
            },
            create: data,
            update: data
          })
        ];

        return result;
      })
      .flat();

    await this.prisma.$transaction([
      ...promises
    ]);
    await this.updateAuditEditDate(uniqueId);

    // Update `statementPublicationDate` on:
    // - a single criterium status update
    // - multiple criteria updates
    const criterium = await this.prisma.criterionResult.findUnique({
      where: {
        pageId_topic_criterium: {
          criterium: body.data[0].criterium,
          topic: body.data[0].topic,
          pageId: body.data[0].pageId
        }
      },
      select: {
        status: true
      }
    });

    const statusChanged = body.data.length === 1 && criterium.status !== body.data[0].status;

    if (body.data.length > 1 || statusChanged) {
      const audit = await this.prisma.audit.findUnique({
        where: { editUniqueId: uniqueId },
        select: { statementPublicationDate: true }
      });

      if (audit.statementPublicationDate) {
        this.updateStatementDate(uniqueId);
      }
    }
  }

  async saveExampleImage(
    editUniqueId: string,
    pageId: number,
    topic: number,
    criterium: number,
    file: Express.Multer.File
  ) {
    const randomPrefix = nanoid();

    const key = `audits/${editUniqueId}/${randomPrefix}/${file.originalname}`;

    const thumbnailKey = `audits/${editUniqueId}/${randomPrefix}/thumbnail_${file.originalname}`;

    const thumbnailBuffer = await sharp(file.buffer)
      .jpeg({
        mozjpeg: true
      })
      .flatten({ background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .resize(200, 200, { fit: "inside" })
      .toBuffer();

    await Promise.all([
      this.fileStorageService.uploadFile(file.buffer, file.mimetype, key),
      this.fileStorageService.uploadFile(
        thumbnailBuffer,
        "image/jpeg",
        thumbnailKey
      )
    ]);

    const exampleImageFile = await this.prisma.exampleImageFile.create({
      data: {
        criterionResult: {
          connect: {
            pageId_topic_criterium: {
              pageId,
              topic,
              criterium
            }
          }
        },

        key,
        originalFilename: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        thumbnailKey
      }
    });

    return exampleImageFile;
  }

  /**
   * Returns true if stored filed was found and deleted. False if not found.
   */
  async deleteExampleImage(
    editUniqueId: string,
    exampleId: number
  ): Promise<boolean> {
    const exampleImageFilePromise = this.prisma.exampleImageFile.findUnique({
      where: {
        id: exampleId
      }
    });

    const exampleImageFile = await exampleImageFilePromise;

    const page = await exampleImageFilePromise.criterionResult().page();

    // Checks whether its a user page or transverse page
    const audit =
      page.url === ""
        ? await exampleImageFilePromise.criterionResult().page().auditTransverse()
        : await exampleImageFilePromise.criterionResult().page().audit();

    if (!audit || audit.editUniqueId !== editUniqueId) {
      return false;
    }

    await this.fileStorageService.deleteMultipleFiles(
      exampleImageFile.key,
      exampleImageFile.thumbnailKey
    );

    await this.prisma.exampleImageFile.delete({
      where: {
        id: exampleId
      }
    });

    return true;
  }

  async saveNotesFile(editUniqueId: string, file: Express.Multer.File) {
    const randomPrefix = nanoid();

    const key = `audits/${editUniqueId}/${randomPrefix}/${file.originalname}`;

    let thumbnailKey;

    if (file.mimetype.startsWith("image")) {
      // If it's an image, create a thumbnail and upload it
      thumbnailKey = `audits/${editUniqueId}/${randomPrefix}/thumbnail_${file.originalname}`;

      const thumbnailBuffer = await sharp(file.buffer)
        .resize(200, 200, { fit: "inside" })
        .jpeg({
          mozjpeg: true
        })
        .toBuffer();

      await Promise.all([
        this.fileStorageService.uploadFile(file.buffer, file.mimetype, key),
        this.fileStorageService.uploadFile(
          thumbnailBuffer,
          "image/jpeg",
          thumbnailKey
        )
      ]);
    } else {
      await this.fileStorageService.uploadFile(file.buffer, file.mimetype, key);
    }

    const noteFile = await this.prisma.notesFile.create({
      data: {
        audit: {
          connect: {
            editUniqueId
          }
        },

        key,
        originalFilename: file.originalname,
        mimetype: file.mimetype,
        size: file.size,

        thumbnailKey
      }
    });

    await this.updateAuditEditDate(editUniqueId);

    return noteFile;
  }

  async uploadEditorImage(file: Express.Multer.File) {
    const randomPrefix = nanoid();

    const key = `editor/${randomPrefix}/${file.originalname}`;

    await this.fileStorageService.uploadFile(file.buffer, file.mimetype, key);

    return key;
  }

  /**
   * Returns true if stored filed was found and deleted. False if not found.
   */
  async deleteNotesFile(
    editUniqueId: string,
    fileId: number
  ): Promise<boolean> {
    const noteFilePromise = this.prisma.notesFile.findUnique({
      where: {
        id: fileId
      }
    });

    const notesFile = await noteFilePromise;
    const audit = await noteFilePromise.audit();

    if (!audit || audit.editUniqueId !== editUniqueId) {
      return false;
    }

    const filesToDelete = [notesFile.key];
    if (notesFile.thumbnailKey) {
      filesToDelete.push(notesFile.thumbnailKey);
    }
    await this.fileStorageService.deleteMultipleFiles(...filesToDelete);

    await this.prisma.notesFile.delete({
      where: {
        id: fileId
      }
    });

    await this.updateAuditEditDate(editUniqueId);

    return true;
  }

  /**
   * Completely delete an audit and all the data associated with it.
   * @returns True if an audit was deleted, false otherwise.
   */
  async hardDeleteAudit(uniqueId: string): Promise<boolean> {
    try {
      const exampleImageFiles = await this.prisma.exampleImageFile.findMany({
        where: {
          criterionResult: {
            page: {
              auditUniqueId: uniqueId
            }
          }
        }
      });
      const notesFiles = await this.prisma.notesFile.findMany({
        where: {
          auditUniqueId: uniqueId
        }
      });

      const keysToDelete = [];
      if (exampleImageFiles.length > 0) {
        keysToDelete.push(
          ...exampleImageFiles.map((file) => [file.key, file.thumbnailKey]).flat()
        );
      }
      if (notesFiles.length > 0) {
        keysToDelete.push(
          ...notesFiles
            .map((file) => [file.key, file.thumbnailKey])
            .flat()
            .filter((key) => key !== null)
        );
      }

      await Promise.all([
        this.prisma.audit.delete({
          where: { editUniqueId: uniqueId }
        }),
        this.fileStorageService.deleteMultipleFiles(...keysToDelete)
      ]);

      return true;
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e?.code === "P2025"
      ) {
        return false;
      }
      throw e;
    }
  }

  /**
   * Mark an audit as deleted and remove auditor informations. Its data will be not be deleted.
   * @returns True if an audit was deleted, false otherwise.
   */
  async softDeleteAudit(uniqueId: string): Promise<boolean> {
    try {
      await this.prisma.audit.update({
        where: { editUniqueId: uniqueId },
        data: {
          isHidden: true,
          auditorEmail: null,
          auditorName: null,
          auditorOrganisation: null
        }
      });
      return true;
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e?.code === "P2025"
      ) {
        return false;
      }
      throw e;
    }
  }

  /**
   * Checks if an audit was deleted by checking the presence of an audit trace.
   * @param uniqueId edit unique id of the checked audit
   */
  async checkIfAuditWasDeleted(uniqueId: string): Promise<boolean> {
    try {
      await this.prisma.auditTrace.findUniqueOrThrow({
        where: { auditEditUniqueId: uniqueId }
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Checks if an audit was deleted by checking the presence of an audit trace.
   * @param consultUniqueId consult unique id of the checked audit
   */
  async checkIfAuditWasDeletedWithConsultId(
    consultUniqueId: string
  ): Promise<boolean> {
    try {
      await this.prisma.auditTrace.findUniqueOrThrow({
        where: { auditConsultUniqueId: consultUniqueId }
      });
      return true;
    } catch {
      return false;
    }
  }

  async publishAudit(uniqueId: string) {
    try {
      return await this.prisma.audit.update({
        where: {
          editUniqueId: uniqueId
        },
        data: {
          publicationDate: new Date()
        },
        include: AUDIT_EDIT_INCLUDE
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e?.code === "P2025"
      ) {
        return;
      }
      throw e;
    }
  }

  /**
   * Update an audit editionDate, only when it has a publication date.
   * @returns the update audit if it is updated, undefined otherwise
   */
  private async updateAuditEditDate(uniqueId: string) {
    const audit = await this.prisma.audit.findUnique({ where: { editUniqueId: uniqueId }, select: { publicationDate: true } });
    if (audit.publicationDate) {
      return this.prisma.audit.update({
        where: { editUniqueId: uniqueId },
        data: { editionDate: new Date() },
        include: AUDIT_EDIT_INCLUDE
      });
    }
  }

  // Either update statement publication or edition date
  private async updateStatementDate(uniqueId: string) {
    const audit = await this.prisma.audit.findUnique({
      where: { editUniqueId: uniqueId },
      select: { statementPublicationDate: true }
    });

    return this.prisma.audit.update({
      where: { editUniqueId: uniqueId },
      data: audit.statementPublicationDate
        ? { statementEditionDate: new Date() }
        : { statementPublicationDate: new Date() },
      include: AUDIT_EDIT_INCLUDE
    });
  }

  async getAuditReportData(
    consultUniqueId: string
  ): Promise<AuditReportDto | undefined> {
    const audit = await this.prisma.audit.findUnique({
      where: { consultUniqueId },
      include: AUDIT_EDIT_INCLUDE
    });

    if (!audit) {
      return;
    }

    const results = await Promise.all([
      this.prisma.criterionResult.findMany({
        where: {
          page: {
            auditUniqueId: audit.editUniqueId
          },
          OR: CRITERIA_BY_AUDIT_TYPE[audit.auditType]
        },
        include: {
          exampleImages: true
        }
      }),
      this.prisma.criterionResult.findMany({
        where: {
          pageId: audit.transverseElementsPageId,
          OR: CRITERIA_BY_AUDIT_TYPE[audit.auditType]
        },
        include: {
          exampleImages: true
        }
      })
    ]).then(results => results.flat());

    const groupedCriteria = results.reduce<Record<string, CriterionResult[]>>(
      (acc, c) => {
        const key = `${c.topic}.${c.criterium}`;
        if (acc[key]) {
          acc[key].push(c);
        } else {
          acc[key] = [c];
        }
        return acc;
      },
      {}
    );

    const applicableCriteria = Object.values(groupedCriteria).filter(
      (criteria) => criteria.some((c) => isCompliant(c) || isNotCompliant(c))
    );

    const compliantCriteria = applicableCriteria.filter((criteria) => {
      // remove untested transverse criterion
      const withoutUntestedTrans = criteria.filter(
        (c) =>
          !isTransverse(c, audit.transverseElementsPageId) || !isNotTested(c)
      );

      return (
        withoutUntestedTrans.some((c) => isCompliant(c)) &&
        withoutUntestedTrans.every((c) => isCompliant(c) || isNotApplicable(c))
      );
    });

    const notCompliantCriteria = applicableCriteria.filter((criteria) => {
      return criteria.some((c) => isNotCompliant(c));
    });

    const notApplicableCriteria = Object.values(groupedCriteria).filter(
      (criteria) => {
        // remove untested transverse criterion
        const withoutUntestedTrans = criteria.filter(
          (c) =>
            !isTransverse(c, audit.transverseElementsPageId) || !isNotTested(c)
        );

        return withoutUntestedTrans.every((c) => isNotApplicable(c));
      }
    );

    const accessibilityRate =
      Math.round(
        (compliantCriteria.length / applicableCriteria.length) * 100
      ) || 0;

    const totalCriteriaCount = CRITERIA_BY_AUDIT_TYPE[audit.auditType].length;

    const report: AuditReportDto = {
      consultUniqueId: audit.consultUniqueId,

      contactEmail: audit.contactEmail,
      contactFormUrl: audit.contactFormUrl,

      procedureInitiator: audit.initiator,
      procedureName: audit.procedureName,
      procedureUrl: audit.procedureUrl,
      auditType: audit.auditType,
      creationDate: audit.creationDate,
      publishDate: audit.publicationDate,
      updateDate: audit.editionDate,
      statementPublicationDate: audit.statementPublicationDate,
      statementEditionDate: audit.statementEditionDate,

      notCompliantContent: audit.notCompliantContent,
      derogatedContent: audit.derogatedContent,
      notInScopeContent: audit.notInScopeContent,
      notes: audit.notes,
      notesFiles: audit.notesFiles.map((file) => ({
        originalFilename: file.originalFilename,
        key: file.key,
        thumbnailKey: file.thumbnailKey,
        size: file.size,
        mimetype: file.mimetype
      })),

      criteriaCount: {
        total: totalCriteriaCount,
        compliant: compliantCriteria.length,
        notCompliant: notCompliantCriteria.length,
        blocking: uniqBy(
          results.filter(
            (r) =>
              r.status === CriterionResultStatus.NOT_COMPLIANT &&
              r.userImpact === CriterionResultUserImpact.BLOCKING
          ),
          (r) => `${r.topic}.${r.criterium}`
        ).length,
        applicable: applicableCriteria.length,
        notApplicable: notApplicableCriteria.length
      },

      accessibilityRate,

      // FIXME: some of the return data is never asked to the user
      context: {
        auditorName: audit.auditorName,
        auditorEmail: null,
        auditorOrganisation: audit.auditorOrganisation,
        environments: audit.environments.map((e) => ({
          platform: e.platform,
          operatingSystem: e.operatingSystem,
          assistiveTechnology: e.assistiveTechnology,
          browser: e.browser
        })),
        samples: sortBy(
          [audit.transverseElementsPage, ...audit.pages].map((p, i) => ({
            name: p.name,
            order: p.order,
            number: i + 1,
            url: p.url,
            id: p.id
          })),
          "order"
        ),
        tools: audit.tools,
        technologies: audit.technologies
      },

      pageDistributions: [
        audit.transverseElementsPage,
        ...sortBy(audit.pages, "order")
      ].map((p) => ({
        name: p.name,
        compliant: {
          raw: results.filter(
            (r) =>
              r.pageId === p.id && r.status === CriterionResultStatus.COMPLIANT
          ).length,
          percentage:
            (results.filter(
              (r) =>
                r.pageId === p.id &&
                r.status === CriterionResultStatus.COMPLIANT
            ).length /
              totalCriteriaCount) *
            100
        },
        notApplicable: {
          raw: results.filter(
            (r) =>
              r.pageId === p.id &&
              r.status === CriterionResultStatus.NOT_APPLICABLE
          ).length,
          percentage:
            (results.filter(
              (r) =>
                r.pageId === p.id &&
                r.status === CriterionResultStatus.NOT_APPLICABLE
            ).length /
              totalCriteriaCount) *
            100
        },
        notCompliant: {
          raw: results.filter(
            (r) =>
              r.pageId === p.id &&
              r.status === CriterionResultStatus.NOT_COMPLIANT
          ).length,
          percentage:
            (results.filter(
              (r) =>
                r.pageId === p.id &&
                r.status === CriterionResultStatus.NOT_COMPLIANT
            ).length /
              totalCriteriaCount) *
            100
        }
      })),

      resultDistribution: {
        compliant: {
          raw: compliantCriteria.length,
          percentage: (compliantCriteria.length / totalCriteriaCount) * 100
        },
        notApplicable: {
          raw: notApplicableCriteria.length,
          percentage: (notApplicableCriteria.length / totalCriteriaCount) * 100
        },
        notCompliant: {
          raw: notCompliantCriteria.length,
          percentage: (notCompliantCriteria.length / totalCriteriaCount) * 100
        }
      },

      topicDistributions: RGAA.topics
        .map((t) => {
          const total = CRITERIA_BY_AUDIT_TYPE[audit.auditType].filter(
            (c) => c.topic === t.number
          ).length;

          const compliantRaw = compliantCriteria.filter(
            (c) => c[0].topic === t.number
          ).length;

          const notApplicableRaw = notApplicableCriteria.filter(
            (c) => c[0].topic === t.number
          ).length;

          const notCompliantRaw = notCompliantCriteria.filter(
            (c) => c[0].topic === t.number
          ).length;

          return {
            name: t.topic,
            compliant: {
              raw: compliantRaw,
              percentage: (compliantRaw / total) * 100
            },
            notApplicable: {
              raw: notApplicableRaw,
              percentage: (notApplicableRaw / total) * 100
            },
            notCompliant: {
              raw: notCompliantRaw,
              percentage: (notCompliantRaw / total) * 100
            }
          };
        })
        // remove empty topics (for fast and complementary audits)
        .filter(
          (t) => t.compliant.raw + t.notApplicable.raw + t.notCompliant.raw > 0
        ),

      results: results.map((r) => ({
        pageId: r.pageId,
        topic: r.topic,
        criterium: r.criterium,

        status: r.status,

        compliantComment: r.compliantComment,
        notCompliantComment: r.notCompliantComment,
        notApplicableComment: r.notApplicableComment,
        userImpact: r.userImpact,
        quickWin: r.quickWin,
        exampleImages: r.exampleImages.map((img) => ({
          filename: img.originalFilename,
          key: img.key,
          thumbnailKey: img.thumbnailKey
        }))
      })),

      transverseElements: audit.transverseElements
    };

    return report;
  }

  async isAuditComplete(uniqueId: string): Promise<boolean> {
    const audit = await this.findAuditWithEditUniqueId(uniqueId, {
      pages: true
    });

    const testedCount = await this.prisma.criterionResult.count({
      where: {
        page: {
          auditUniqueId: uniqueId
        },
        criterium: {
          in: CRITERIA_BY_AUDIT_TYPE[audit.auditType].map((c) => c.criterium)
        },
        topic: {
          in: CRITERIA_BY_AUDIT_TYPE[audit.auditType].map((c) => c.topic)
        },
        status: {
          not: CriterionResultStatus.NOT_TESTED
        }
      }
    });

    const expectedCount =
      CRITERIA_BY_AUDIT_TYPE[audit.auditType].length * audit.pages.length;

    return testedCount === expectedCount;
  }

  async duplicateAudit(sourceUniqueId: string, newAuditName: string): Promise<AuditDto> {
    const originalAudit = await this.prisma.audit.findFirst({
      where: { editUniqueId: sourceUniqueId, isHidden: false },
      include: {
        environments: true,
        transverseElementsPage: {
          include: {
            results: {
              include: {
                exampleImages: true
              }
            }
          }
        },
        pages: {
          include: {
            results: {
              include: {
                exampleImages: true
              }
            }
          }
        },
        notesFiles: true
      }
    });

    if (!originalAudit) {
      return;
    }

    const duplicateEditUniqueId = nanoid();
    const duplicateConsultUniqueId = nanoid();

    /**
    Object storing duplicate exampleImage creation data mapped by
    - page id
    - result id
    - example id

    This object is used within the call to prisma.audit.create() to duplicate the example images.

    Example content:
    ```
    {
      'page-id': {
        'result-id': {
          'example-id': {
            filename: 'foo',
            ...
          }
        }
      }
    }
    ```
    */
    const imagesCreateData: {
      [pageId: string]: {
        [resultId: string]: Prisma.ExampleImageFileCreateInput;
      };
    } = {};

    /**
    Array storing duplicate notesFiles creation data
    */
    const notesFilesCreateData = [];

    /**
     * contains s3 file duplications which will be executed together by calling
     * `fileStorageService.duplicateMultipleFiles()`
     */
    const fileDuplications: { originalKey: string; destinationKey: string }[] =
      [];

    [...originalAudit.pages, originalAudit.transverseElementsPage].forEach(
      (p) => {
        p.results.forEach((r) => {
          r.exampleImages.forEach((e) => {
            const randomPrefix = nanoid();

            const key = `audits/${duplicateEditUniqueId}/${randomPrefix}/${e.originalFilename}`;
            const thumbnailKey = `audits/${duplicateEditUniqueId}/${randomPrefix}/thumbnail_${e.originalFilename}`;

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
      }
    );

    originalAudit.notesFiles.forEach((e) => {
      const randomPrefix = nanoid();

      // No thumbnail? It means there is no image as well!
      const hasThumbnail = e.thumbnailKey !== null;

      const key = `audits/${duplicateEditUniqueId}/${randomPrefix}/${e.originalFilename}`;

      const thumbnailKey = hasThumbnail
        ? `audits/${duplicateEditUniqueId}/${randomPrefix}/thumbnail_${e.originalFilename}`
        : null;

      if (hasThumbnail) {
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

    const newAudit = await this.prisma.audit.create({
      data: {
        ...omit(originalAudit, [
          // ignore ids
          "id",
          "auditTraceId",
          "sourceAuditId",
          "transverseElementsPageId",

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

        // link new audit with the original
        sourceAudit: {
          connect: {
            editUniqueId: sourceUniqueId
          }
        },

        editUniqueId: duplicateEditUniqueId,
        consultUniqueId: duplicateConsultUniqueId,

        procedureName: newAuditName,

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
      },
      select: AUDIT_PRISMA_SELECT
    });

    return newAudit;
  }

  async anonymiseAudits(userEmail: string) {
    await this.prisma.audit.updateMany({
      where: {
        auditorEmail: userEmail
      },
      data: {
        auditorEmail: null,
        auditorName: null,
        showAuditorEmailInReport: false
      }
    });
  }

  async getAuditsByAuditorEmail(email: string): Promise<AuditListingItemDto[]> {
    // for some reason, the type of `creationDate` is not nullable even tho it is in the DB
    // it seems that using `select` or `include` makes the nullable properties of audits non-nullable
    const audits = await this.prisma.audit.findMany({
      where: {
        auditorEmail: email,
        isHidden: false
      },
      select: {
        procedureName: true,
        creationDate: true,
        auditType: true,
        editUniqueId: true,
        consultUniqueId: true,
        initiator: true,
        transverseElementsPageId: true,
        pages: {
          select: {
            results: true
          }
        },
        transverseElementsPage: {
          select: {
            results: true
          }
        }
      }
    });

    const unorderedAudits: AuditListingItemDto[] = audits.map((a) => {
      const allResults = [
        ...a.transverseElementsPage.results,
        ...a.pages.flatMap((p) => p.results)
      ];

      const pagesResults = a.pages.flatMap((p) => p.results);
      const actualResults = pagesResults.filter((r) =>
        CRITERIA_BY_AUDIT_TYPE[a.auditType].find(
          (e) => e.topic === r.topic && e.criterium === r.criterium
        )
      );
      const progress =
        actualResults.filter(
          (r) => r.status !== CriterionResultStatus.NOT_TESTED
        ).length /
        (CRITERIA_BY_AUDIT_TYPE[a.auditType].length * a.pages.length);

      let complianceLevel = null;

      if (progress >= 1) {
        const resultsGroupedById = allResults.reduce<
          Record<string, CriterionResult[]>
        >((acc, c) => {
          const key = `${c.topic}.${c.criterium}`;
          if (acc[key]) {
            acc[key].push(c);
          } else {
            acc[key] = [c];
          }
          return acc;
        }, {});

        const results2 = CRITERIA_BY_AUDIT_TYPE[a.auditType].map(
          (c) => resultsGroupedById[`${c.topic}.${c.criterium}`] ?? null
        );

        const applicableCriteria = results2.filter((criteria) =>
          criteria.some((c) => isCompliant(c) || isNotCompliant(c))
        );

        const compliantCriteria = applicableCriteria.filter((criteria) => {
          // remove untested transverse criterion
          const withoutUntestedTrans = criteria.filter(
            (c) =>
              !isTransverse(c, a.transverseElementsPageId) || !isNotTested(c)
          );

          return (
            withoutUntestedTrans.some((c) => isCompliant(c)) &&
            withoutUntestedTrans.every(
              (c) => isCompliant(c) || isNotApplicable(c)
            )
          );
        });

        complianceLevel = Math.round(
          (compliantCriteria.length / applicableCriteria.length) * 100
        );
      }

      const statementIsPublished = !!a.initiator;

      const auditIsComplete =
        actualResults.length ===
          CRITERIA_BY_AUDIT_TYPE[a.auditType].length * a.pages.length &&
        actualResults.every((r) => r.status !== "NOT_TESTED");

      return {
        ...pick(
          a,
          "procedureName",
          "editUniqueId",
          "consultUniqueId",
          "creationDate",
          "auditType"
        ),
        complianceLevel,
        status:
          progress === 0
            ? "NOT_STARTED"
            : auditIsComplete
              ? "COMPLETED"
              : "IN_PROGRESS",
        estimatedCsvSize: 502 + a.pages.length * 318,
        statementIsPublished,
        progress
      };
    });

    // Separate audits with/without creationDate and order them
    const partitionedAudits = partition(unorderedAudits, (a) => a.creationDate);
    const orderedAudits = [
      ...orderBy(partitionedAudits[0], (a) => a.creationDate, ["desc"]),
      ...partitionedAudits[1]
    ];

    return orderedAudits;
  }

  async updateAuditStatementData(
    editUniqueId: string,
    data: UpdateStatementDto
  ): Promise<AuditDto | undefined> {
    await this.prisma.audit.update({
      where: { editUniqueId },
      data: {
        initiator: data.initiator,
        auditorOrganisation: data.auditorOrganisation,
        procedureUrl: data.procedureUrl,
        contactName: data.contactName,
        contactEmail: data.contactEmail,
        contactFormUrl: data.contactFormUrl,
        technologies: data.technologies,
        tools: data.tools,
        environments: {
          deleteMany: {
            OR: [
              {
                platform: {
                  notIn: data.environments.map((e) => e.platform)
                }
              },
              {
                operatingSystem: {
                  notIn: data.environments.map((e) => e.operatingSystem)
                }
              },
              {
                assistiveTechnology: {
                  notIn: data.environments.map((e) => e.assistiveTechnology)
                }
              },
              {
                browser: {
                  notIn: data.environments.map((e) => e.browser)
                }
              }
            ]
          },
          upsert: data.environments.map((environment) => ({
            where: {
              platform_operatingSystem_assistiveTechnology_browser_auditUniqueId:
                    {
                      auditUniqueId: editUniqueId,
                      platform: environment.platform,
                      operatingSystem: environment.operatingSystem,
                      assistiveTechnology: environment.assistiveTechnology,
                      browser: environment.browser
                    }
            },
            create: environment,
            update: environment
          }))
        },
        notCompliantContent: data.notCompliantContent,
        derogatedContent: data.derogatedContent,
        notInScopeContent: data.notInScopeContent
      },
      select: AUDIT_PRISMA_SELECT
    });

    const audit = await this.updateStatementDate(editUniqueId);

    return audit;
  }
}
