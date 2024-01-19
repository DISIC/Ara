import { Injectable } from "@nestjs/common";
import {
  Audit,
  AuditedPage,
  CriterionResult,
  CriterionResultStatus,
  CriterionResultUserImpact,
  Prisma,
  StoredFile,
  TestEnvironment
} from "@prisma/client";
import { nanoid } from "nanoid";
import sharp from "sharp";
import { omit, pick, setWith, uniqBy } from "lodash";

import { PrismaService } from "../prisma.service";
import * as RGAA from "../rgaa.json";
import { AuditReportDto } from "./dto/audit-report.dto";
import { CreateAuditDto } from "./dto/create-audit.dto";
import { CRITERIA_BY_AUDIT_TYPE } from "./criteria";
import { FileStorageService } from "./file-storage.service";
import { UpdateAuditDto } from "./dto/update-audit.dto";
import { UpdateResultsDto } from "./dto/update-results.dto";
import { PatchAuditDto } from "./dto/patch-audit.dto";

const AUDIT_EDIT_INCLUDE: Prisma.AuditInclude = {
  recipients: true,
  environments: true,
  pages: true,
  sourceAudit: {
    select: {
      procedureName: true
    }
  }
};

@Injectable()
export class AuditService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileStorageService: FileStorageService
  ) {}

  createAudit(data: CreateAuditDto) {
    const editUniqueId = nanoid();
    const consultUniqueId = nanoid();

    return this.prisma.audit.create({
      data: {
        editUniqueId,
        consultUniqueId,

        creationDate: new Date(),

        procedureName: data.procedureName,

        auditType: data.auditType,

        auditorEmail: data.auditorEmail,
        auditorName: data.auditorName,

        pages: {
          createMany: {
            data: data.pages.map((p, i) => {
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
      include: AUDIT_EDIT_INCLUDE
    });
  }

  // getAuditWithConsultUniqueId(uniqueId: string) {
  //   return this.prisma.audit.findUnique({
  //     where: { consultUniqueId: uniqueId },
  //   });
  // }

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
        }
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
    Omit<
      CriterionResult & { exampleImages: StoredFile[] },
      "id" | "auditUniqueId"
    >[]
  > {
    const [audit, pages, existingResults] = await Promise.all([
      this.prisma.audit.findUnique({
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
      })
    ]);

    // We do not create every empty criterion result rows in the db when creating pages.
    // Instead we return the results in the database and fill missing criteria with placeholder data.
    return pages.flatMap((page) =>
      CRITERIA_BY_AUDIT_TYPE[audit.auditType].map((criterion) => {
        const existingResult = existingResults.find(
          (result) =>
            result.pageId === page.id &&
            result.topic === criterion.topic &&
            result.criterium == criterion.criterium
        );

        if (existingResult) return existingResult;

        // return placeholder result
        return {
          status: CriterionResultStatus.NOT_TESTED,
          compliantComment: null,
          errorDescription: null,
          userImpact: null,
          recommandation: null,
          notApplicableComment: null,
          exampleImages: [],
          transverse: false,
          quickWin: false,

          topic: criterion.topic,
          criterium: criterion.criterium,
          pageId: page.id
        };
      })
    );
  }

  async updateAudit(
    uniqueId: string,
    data: UpdateAuditDto
  ): Promise<Audit | undefined> {
    try {
      const updatedPages = data.pages.sort((p) => p.order).filter((p) => p.id);
      const newPages = data.pages.sort((p) => p.order).filter((p) => !p.id);

      const [audit] = await this.prisma.$transaction([
        this.prisma.audit.update({
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

            // recipients: {
            //   deleteMany: {
            //     email: {
            //       notIn: data.recipients.map((r) => r.email),
            //     },
            //   },

            //   // create or update recipients
            //   upsert: data.recipients.map((recipient) => ({
            //     where: {
            //       email_auditUniqueId: {
            //         auditUniqueId: uniqueId,
            //         email: recipient.email,
            //       },
            //     },
            //     create: recipient,
            //     update: recipient,
            //   })),
            // },

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
                    operatingSystemVersion: {
                      notIn: data.environments.map(
                        (e) => e.operatingSystemVersion
                      )
                    }
                  },
                  {
                    assistiveTechnology: {
                      notIn: data.environments.map((e) => e.assistiveTechnology)
                    }
                  },
                  {
                    assistiveTechnologyVersion: {
                      notIn: data.environments.map(
                        (e) => e.assistiveTechnologyVersion
                      )
                    }
                  },
                  {
                    browser: {
                      notIn: data.environments.map((e) => e.browser)
                    }
                  },
                  {
                    browserVersion: {
                      notIn: data.environments.map((e) => e.browserVersion)
                    }
                  }
                ]
              },
              upsert: data.environments.map((environment) => ({
                where: {
                  platform_operatingSystem_operatingSystemVersion_assistiveTechnology_assistiveTechnologyVersion_browser_browserVersion_auditUniqueId:
                    {
                      auditUniqueId: uniqueId,
                      platform: environment.platform,
                      operatingSystem: environment.operatingSystem,
                      operatingSystemVersion:
                        environment.operatingSystemVersion,
                      assistiveTechnology: environment.assistiveTechnology,
                      assistiveTechnologyVersion:
                        environment.assistiveTechnologyVersion,
                      browser: environment.browser,
                      browserVersion: environment.browserVersion
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
              update: updatedPages.map((p, i) => ({
                where: { id: p.id },
                data: {
                  order: i,
                  name: p.name,
                  url: p.url
                }
              })),
              createMany: {
                data: newPages.map((p, i) => ({
                  order: i,
                  name: p.name,
                  url: p.url
                }))
              }
            },
            notCompliantContent: data.notCompliantContent,
            derogatedContent: data.derogatedContent,
            notInScopeContent: data.notInScopeContent,
            notes: data.notes
          },
          include: AUDIT_EDIT_INCLUDE
        }),
        this.updateAuditEditDate(uniqueId)
      ]);
      return audit;
    } catch (e) {
      // Audit does not exist
      // https://www.prisma.io/docs/reference/api-reference/error-reference#p2025
      if (e?.code === "P2025") {
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
        data: { notes: data.notes }
      });

      return audit;
    } catch (e) {
      // Audit does not exist
      // https://www.prisma.io/docs/reference/api-reference/error-reference#p2025
      if (e?.code === "P2025") {
        return;
      }
      throw e;
    }
  }

  async updateResults(uniqueId: string, body: UpdateResultsDto) {
    const pages = await this.prisma.auditedPage.findMany({
      where: { auditUniqueId: uniqueId }
    });

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
          errorDescription: item.errorDescription,
          notApplicableComment: item.notApplicableComment,
          recommandation: item.recommandation,
          userImpact: item.userImpact,
          quickWin: item.quickWin,
          transverse: item.transverse
        };

        const result = [
          this.prisma.criterionResult.upsert({
            where: {
              // auditUniqueId_pageUrl_topic_criterium: {
              //   auditUniqueId: uniqueId,
              //   criterium: item.criterium,
              //   pageUrl: item.pageUrl,
              //   topic: item.topic,
              // },
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

        if (item.transverse) {
          pages
            .filter((page) => page.id !== item.pageId)
            .forEach((page) => {
              const data: Prisma.CriterionResultUpsertArgs["create"] = {
                criterium: item.criterium,
                topic: item.topic,
                page: {
                  connect: {
                    id: page.id
                  }
                },

                status: item.status,
                transverse: true,

                ...(item.status === CriterionResultStatus.COMPLIANT && {
                  compliantComment: item.compliantComment
                }),

                ...(item.status === CriterionResultStatus.NOT_COMPLIANT && {
                  errorDescription: item.errorDescription,
                  recommandation: item.recommandation,
                  userImpact: item.userImpact,
                  quickWin: item.quickWin
                }),

                ...(item.status === CriterionResultStatus.NOT_APPLICABLE && {
                  notApplicableComment: item.notApplicableComment
                })
              };

              result.push(
                this.prisma.criterionResult.upsert({
                  where: {
                    pageId_topic_criterium: {
                      criterium: item.criterium,
                      topic: item.topic,
                      pageId: page.id
                    }
                  },
                  create: data,
                  update: data
                })
              );
            });
        }

        return result;
      })
      .flat();

    await this.prisma.$transaction([
      ...promises,
      this.updateAuditEditDate(uniqueId)
    ]);
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
      .resize(200, 200, { fit: "cover" })
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

    const publicUrl = this.fileStorageService.getPublicUrl(key);
    const thumbnailUrl = this.fileStorageService.getPublicUrl(thumbnailKey);

    const storedFile = await this.prisma.storedFile.create({
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
        size: file.size,
        url: publicUrl,

        thumbnailKey,
        thumbnailUrl
      }
    });

    return storedFile;
  }

  /**
   * Returns true if stored filed was found and deleted. False if not found.
   */
  async deleteExampleImage(
    editUniqueId: string,
    exampleId: number
  ): Promise<boolean> {
    const storedFilePromise = this.prisma.storedFile.findUnique({
      where: {
        id: exampleId
      }
    });

    const storedFile = await storedFilePromise;
    const audit = await storedFilePromise.criterionResult().page().audit();

    if (!audit || audit.editUniqueId !== editUniqueId) {
      return false;
    }

    await this.fileStorageService.deleteMultipleFiles(
      storedFile.key,
      storedFile.thumbnailKey
    );

    await this.prisma.storedFile.delete({
      where: {
        id: exampleId
      }
    });

    return true;
  }

  /**
   * Delete an audit and the data associated with it.
   * @returns True if an audit was deleted, false otherwise.
   */
  async deleteAudit(uniqueId: string): Promise<boolean> {
    try {
      const storedFiles = await this.prisma.storedFile.findMany({
        where: {
          criterionResult: {
            page: {
              auditUniqueId: uniqueId
            }
          }
        }
      });

      await Promise.all([
        await this.prisma.audit.delete({
          where: { editUniqueId: uniqueId }
        }),
        ...(storedFiles.length > 0
          ? [
              this.fileStorageService.deleteMultipleFiles(
                ...storedFiles
                  .map((file) => [file.key, file.thumbnailKey])
                  .flat()
              )
            ]
          : [])
      ]);

      return true;
    } catch (e) {
      if (e?.code === "P2025") {
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
          // editionDate: null,
        },
        include: AUDIT_EDIT_INCLUDE
      });
    } catch (e) {
      if (e?.code === "P2025") {
        return;
      }
      throw e;
    }
  }

  private updateAuditEditDate(uniqueId: string) {
    return this.prisma.audit.updateMany({
      where: { editUniqueId: uniqueId, publicationDate: { not: null } },
      data: { editionDate: new Date() }
    });
  }

  async getAuditReportData(
    consultUniqueId: string
  ): Promise<AuditReportDto | undefined> {
    const audit = (await this.prisma.audit.findUnique({
      where: { consultUniqueId },
      include: AUDIT_EDIT_INCLUDE
    })) as Audit & {
      environments: TestEnvironment[];
      pages: AuditedPage[];
    };

    if (!audit) {
      return;
    }

    const results = await this.prisma.criterionResult.findMany({
      where: {
        page: {
          auditUniqueId: audit.editUniqueId
        },
        criterium: {
          in: CRITERIA_BY_AUDIT_TYPE[audit.auditType].map((c) => c.criterium)
        },
        topic: {
          in: CRITERIA_BY_AUDIT_TYPE[audit.auditType].map((c) => c.topic)
        }
      },
      include: {
        exampleImages: true
      }
    });

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
      (criteria) =>
        criteria.some((c) => c.status !== CriterionResultStatus.NOT_APPLICABLE)
    );

    const notApplicableCriteria = Object.values(groupedCriteria).filter(
      (criteria) =>
        criteria.every((c) => c.status === CriterionResultStatus.NOT_APPLICABLE)
    );

    const compliantCriteria = applicableCriteria.filter((criteria) =>
      criteria.every(
        (c) =>
          c.status === CriterionResultStatus.COMPLIANT ||
          c.status === CriterionResultStatus.NOT_APPLICABLE
      )
    );

    const notCompliantCriteria = applicableCriteria.filter((criteria) =>
      criteria.some((c) => c.status === CriterionResultStatus.NOT_COMPLIANT)
    );

    const accessibilityRate = Math.round(
      (compliantCriteria.length / applicableCriteria.length) * 100
    );

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

      notCompliantContent: audit.notCompliantContent,
      derogatedContent: audit.derogatedContent,
      notInScopeContent: audit.notInScopeContent,
      notes: audit.notes,

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
        desktopEnvironments: audit.environments
          .filter((e) => e.platform === "desktop")
          .map((e) => ({
            operatingSystem: e.operatingSystem,
            operatingSystemVersion: e.operatingSystemVersion,
            assistiveTechnology: e.assistiveTechnology,
            assistiveTechnologyVersion: e.assistiveTechnologyVersion,
            browser: e.browser,
            browserVersion: e.browserVersion
          })),
        mobileEnvironments: audit.environments
          .filter((e) => e.platform === "mobile")
          .map((e) => ({
            operatingSystem: e.operatingSystem,
            operatingSystemVersion: e.operatingSystemVersion,
            assistiveTechnology: e.assistiveTechnology,
            assistiveTechnologyVersion: e.assistiveTechnologyVersion,
            browser: e.browser,
            browserVersion: e.browserVersion
          })),
        referencial: "RGAA Version 4.1",
        samples: audit.pages
          .map((p, i) => ({
            name: p.name,
            order: p.order,
            number: i + 1,
            url: p.url,
            id: p.id
          }))
          .sort((p) => p.order),
        tools: audit.tools,
        technologies: audit.technologies
      },

      pageDistributions: audit.pages.map((p) => ({
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
        transverse: r.transverse,

        compliantComment: r.compliantComment,
        errorDescription: r.errorDescription,
        notApplicableComment: r.notApplicableComment,
        recommandation: r.recommandation,
        userImpact: r.userImpact,
        quickWin: r.quickWin,
        exampleImages: r.exampleImages.map((img) => ({
          url: img.url,
          filename: img.originalFilename
        }))
      }))
    };

    return report;
  }

  async isAuditComplete(uniqueId: string): Promise<boolean> {
    const audit = await this.prisma.audit.findUnique({
      where: { editUniqueId: uniqueId },
      include: { pages: true }
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

  async duplicateAudit(sourceUniqueId: string, newAuditName: string) {
    const originalAudit = await this.prisma.audit.findUnique({
      where: { editUniqueId: sourceUniqueId },
      include: {
        environments: true,
        pages: {
          include: {
            results: {
              include: {
                exampleImages: true
              }
            }
          }
        }
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
        [resultId: string]: object;
      };
    } = {};

    /**
     * contains s3 file duplications which will be executed together by calling
     * `fileStorageService.duplicateMultipleFiles()`
     */
    const imageDuplications: { originalKey: string; destinationKey: string }[] =
      [];

    originalAudit.pages.forEach((p) => {
      p.results.forEach((r) => {
        r.exampleImages.forEach((e) => {
          const randomPrefix = nanoid();

          const key = `audits/${duplicateEditUniqueId}/${randomPrefix}/${e.originalFilename}`;
          const thumbnailKey = `audits/${duplicateEditUniqueId}/${randomPrefix}/thumbnail_${e.originalFilename}`;

          const publicUrl = this.fileStorageService.getPublicUrl(key);
          const thumbnailUrl =
            this.fileStorageService.getPublicUrl(thumbnailKey);

          imageDuplications.push(
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
              url: publicUrl,
              size: e.size,
              key: key,
              thumbnailUrl: thumbnailUrl,
              thumbnailKey: thumbnailKey
            },
            Object
          );
        });
      });
    });

    await this.fileStorageService.duplicateMultipleFiles(imageDuplications);

    const newAudit = await this.prisma.audit.create({
      data: {
        ...omit(originalAudit, ["id", "auditTraceId", "sourceAuditId"]),

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
        publicationDate: undefined,

        environments: {
          createMany: {
            data: originalAudit.environments.map((e) =>
              omit(e, ["id", "auditUniqueId"])
            )
          }
        },

        pages: {
          create: originalAudit.pages.map((p) => ({
            name: p.name,
            url: p.url,
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

  async getAuditsByAuditorEmail(email: string) {
    const audits = await this.prisma.audit.findMany({
      where: {
        auditorEmail: email
      },
      select: {
        procedureName: true,
        creationDate: true,
        auditType: true,
        editUniqueId: true,
        consultUniqueId: true,
        pages: {
          select: {
            results: true
          }
        }
      }
    });

    return audits.map((a) => {
      const results = a.pages.flatMap((p) => p.results);

      const progress =
        results.filter((r) => r.status !== CriterionResultStatus.NOT_TESTED)
          .length /
        (CRITERIA_BY_AUDIT_TYPE[a.auditType].length * a.pages.length);

      let complianceLevel = null;

      if (progress >= 1) {
        const resultsGroupedById = results.reduce<
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

        const applicableCriteria = results2.filter(
          (criteria) =>
            criteria &&
            criteria.some(
              (c) => c.status !== CriterionResultStatus.NOT_APPLICABLE
            )
        );

        const compliantCriteria = applicableCriteria.filter((criteria) =>
          criteria.every(
            (c) =>
              c.status === CriterionResultStatus.COMPLIANT ||
              c.status === CriterionResultStatus.NOT_APPLICABLE
          )
        );

        complianceLevel = Math.round(
          (compliantCriteria.length / applicableCriteria.length) * 100
        );
      }

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
        status: progress < 1 ? "IN_PROGRESS" : "COMPLETED",
        estimatedCsvSize: 502 + a.pages.length * 318
      };
    });
  }
}
