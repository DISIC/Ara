import { Injectable } from '@nestjs/common';
import {
  Audit,
  AuditedPage,
  CriterionResult,
  CriterionResultStatus,
  CriterionResultUserImpact,
  Prisma,
  TestEnvironment,
  Tool,
} from '@prisma/client';
import { nanoid } from 'nanoid';

import { PrismaService } from '../prisma.service';
import * as RGAA from '../rgaa.json';
import { AuditReportDto } from './audit-report.dto';
import { CreateAuditDto } from './create-audit.dto';
import { CRITERIA_BY_AUDIT_TYPE } from './criteria';
import { UpdateAuditDto } from './update-audit.dto';
import { UpdateResultsDto } from './update-results.dto';

const AUDIT_EDIT_INCLUDE: Prisma.AuditInclude = {
  recipients: true,
  tools: true,
  environments: true,
  pages: true,
};

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  createAudit(data: CreateAuditDto) {
    const editUniqueId = nanoid();
    const consultUniqueId = nanoid();

    return this.prisma.audit.create({
      data: {
        editUniqueId,
        consultUniqueId,

        procedureName: data.procedureName,

        auditType: data.auditType,

        auditorEmail: data.auditorEmail,
        auditorName: data.auditorName,
        auditorOrganisation: data.auditorOrganisation,

        pages: {
          createMany: {
            data: data.pages,
          },
        },

        auditTrace: {
          create: {
            auditConsultUniqueId: consultUniqueId,
            auditEditUniqueId: editUniqueId,
          },
        },
      },
      include: AUDIT_EDIT_INCLUDE,
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
      include: AUDIT_EDIT_INCLUDE,
    });
  }

  async getResultsWithEditUniqueId(
    uniqueId: string,
  ): Promise<Omit<CriterionResult, 'id' | 'auditUniqueId'>[]> {
    const [audit, pages, existingResults] = await Promise.all([
      this.prisma.audit.findUnique({
        where: {
          editUniqueId: uniqueId,
        },
      }),
      this.prisma.auditedPage.findMany({
        where: { auditUniqueId: uniqueId },
      }),
      this.prisma.criterionResult.findMany({
        where: {
          page: {
            // auditUniqueId: uniqueId,
          },
        },
      }),
    ]);

    // We do not create every empty criterion result rows in the db when creating pages.
    // Instead we return the results in the database and fill missing criteria with placeholder data.
    return pages.flatMap((page) =>
      CRITERIA_BY_AUDIT_TYPE[audit.auditType].map((criterion) => {
        const existingResult = existingResults.find(
          (result) =>
            result.pageId === page.id &&
            result.topic === criterion.topic &&
            result.criterium == criterion.criterium,
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

          topic: criterion.topic,
          criterium: criterion.criterium,
          pageId: page.id,
        };
      }),
    );
  }

  async updateAudit(
    uniqueId: string,
    data: UpdateAuditDto,
  ): Promise<Audit | undefined> {
    try {
      const updatedPages = data.pages.filter((p) => p.id);
      const newPages = data.pages.filter((p) => !p.id);

      const [audit] = await this.prisma.$transaction([
        this.prisma.audit.update({
          where: { editUniqueId: uniqueId },
          data: {
            procedureName: data.procedureName,
            procedureUrl: data.procedureUrl,

            initiator: data.initiator,

            auditorEmail: data.auditorEmail,
            auditorName: data.auditorName,

            contactName: data.contactName,
            contactEmail: data.contactEmail,
            contactFormUrl: data.contactFormUrl,

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

            // step 2
            auditType: data.auditType,
            tools: {
              deleteMany: {
                OR: [
                  {
                    name: {
                      notIn: data.tools.map((t) => t.name),
                    },
                  },
                  {
                    function: {
                      notIn: data.tools.map((t) => t.function),
                    },
                  },
                  {
                    url: {
                      notIn: data.tools.map((t) => t.url),
                    },
                  },
                ],
              },
              upsert: data.tools.map((tool) => ({
                where: {
                  name_function_url_auditUniqueId: {
                    auditUniqueId: uniqueId,
                    name: tool.name,
                    function: tool.function,
                    url: tool.url,
                  },
                },
                create: tool,
                update: tool,
              })),
            },
            environments: {
              deleteMany: {
                OR: [
                  {
                    platform: {
                      notIn: data.environments.map((e) => e.platform),
                    },
                  },
                  {
                    operatingSystem: {
                      notIn: data.environments.map((e) => e.operatingSystem),
                    },
                  },
                  {
                    operatingSystemVersion: {
                      notIn: data.environments.map(
                        (e) => e.operatingSystemVersion,
                      ),
                    },
                  },
                  {
                    assistiveTechnology: {
                      notIn: data.environments.map(
                        (e) => e.assistiveTechnology,
                      ),
                    },
                  },
                  {
                    assistiveTechnologyVersion: {
                      notIn: data.environments.map(
                        (e) => e.assistiveTechnologyVersion,
                      ),
                    },
                  },
                  {
                    browser: {
                      notIn: data.environments.map((e) => e.browser),
                    },
                  },
                  {
                    browserVersion: {
                      notIn: data.environments.map((e) => e.browserVersion),
                    },
                  },
                ],
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
                      browserVersion: environment.browserVersion,
                    },
                },
                create: environment,
                update: environment,
              })),
            },
            pages: {
              deleteMany: {
                id: {
                  notIn: updatedPages.map((p) => p.id),
                },
              },
              update: updatedPages.map((p) => ({
                where: { id: p.id },
                data: {
                  name: p.name,
                  url: p.url,
                },
              })),
              createMany: {
                data: newPages.map((p) => ({
                  name: p.name,
                  url: p.url,
                })),
              },
            },
            notCompliantContent: data.notCompliantContent,
            derogatedContent: data.derogatedContent,
            notInScopeContent: data.notInScopeContent,
          },
          include: AUDIT_EDIT_INCLUDE,
        }),
        this.updateAuditEditDate(uniqueId),
      ]);
      return audit;
    } catch (e) {
      // Audit does not exist
      // https://www.prisma.io/docs/reference/api-reference/error-reference#p2025
      if (e?.code === 'P2025') {
        return;
      }
      throw e;
    }
  }

  async updateResults(uniqueId: string, body: UpdateResultsDto) {
    const promises = body.data.map((item) => {
      const data: Prisma.CriterionResultUpsertArgs['create'] = {
        criterium: item.criterium,
        topic: item.topic,
        page: {
          connect: {
            // url_auditUniqueId: {
            //   auditUniqueId: uniqueId,
            //   url: item.pageUrl,
            // },
            id: item.pageId,
          },
        },

        status: item.status,
        compliantComment: item.compliantComment,
        errorDescription: item.errorDescription,
        notApplicableComment: item.notApplicableComment,
        recommandation: item.recommandation,
        userImpact: item.userImpact,
      };

      return this.prisma.criterionResult.upsert({
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
            pageId: item.pageId,
          },
        },
        create: data,
        update: data,
      });
    });

    // await Promise.all(promises);
    await this.prisma.$transaction([
      ...promises,
      this.updateAuditEditDate(uniqueId),
    ]);
  }

  /**
   * Delete an audit and the data associated with it.
   * @returns True if an audit was deleted, false otherwise.
   */
  async deleteAudit(uniqueId: string): Promise<boolean> {
    try {
      await this.prisma.audit.delete({ where: { editUniqueId: uniqueId } });
      return true;
    } catch (e) {
      if (e?.code === 'P2025') {
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
        where: { auditEditUniqueId: uniqueId },
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
    consultUniqueId: string,
  ): Promise<boolean> {
    try {
      await this.prisma.auditTrace.findUniqueOrThrow({
        where: { auditConsultUniqueId: consultUniqueId },
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
          editUniqueId: uniqueId,
        },
        data: {
          publicationDate: new Date(),
          editionDate: null,
        },
        include: AUDIT_EDIT_INCLUDE,
      });
    } catch (e) {
      if (e?.code === 'P2025') {
        return;
      }
      throw e;
    }
  }

  private updateAuditEditDate(uniqueId: string) {
    return this.prisma.audit.updateMany({
      where: { editUniqueId: uniqueId, publicationDate: { not: null } },
      data: { editionDate: new Date() },
    });
  }

  async getAuditReportData(
    consultUniqueId: string,
  ): Promise<AuditReportDto | undefined> {
    const audit = (await this.prisma.audit.findUnique({
      where: { consultUniqueId },
      include: AUDIT_EDIT_INCLUDE,
    })) as Audit & {
      tools: Tool[];
      environments: TestEnvironment[];
      pages: AuditedPage[];
    };

    if (!audit) {
      return;
    }

    const results = await this.prisma.criterionResult.findMany({
      where: {
        page: {
          auditUniqueId: audit.editUniqueId,
        },
        criterium: {
          in: CRITERIA_BY_AUDIT_TYPE[audit.auditType].map((c) => c.criterium),
        },
        topic: {
          in: CRITERIA_BY_AUDIT_TYPE[audit.auditType].map((c) => c.topic),
        },
      },
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
      {},
    );

    const applicableCriteria = Object.values(groupedCriteria).filter(
      (criteria) =>
        criteria.some((c) => c.status !== CriterionResultStatus.NOT_APPLICABLE),
    );

    const notApplicableCriteria = Object.values(groupedCriteria).filter(
      (criteria) =>
        criteria.every(
          (c) => c.status === CriterionResultStatus.NOT_APPLICABLE,
        ),
    );

    const compliantCriteria = applicableCriteria.filter((criteria) =>
      criteria.every(
        (c) =>
          c.status === CriterionResultStatus.COMPLIANT ||
          c.status === CriterionResultStatus.NOT_APPLICABLE,
      ),
    );

    const notCompliantCriteria = applicableCriteria.filter((criteria) =>
      criteria.some((c) => c.status === CriterionResultStatus.NOT_COMPLIANT),
    );

    const accessibilityRate = Math.round(
      (compliantCriteria.length / applicableCriteria.length) * 100,
    );

    const totalCriteriaCount = CRITERIA_BY_AUDIT_TYPE[audit.auditType].length;

    const report: AuditReportDto = {
      consultUniqueId: audit.consultUniqueId,

      contactFormUrl: audit.contactFormUrl,

      procedureInitiator: audit.initiator,
      procedureName: audit.procedureName,
      procedureUrl: audit.procedureUrl,
      auditType: audit.auditType,
      publishDate: audit.publicationDate,
      updateDate: audit.editionDate,

      notCompliantContent: audit.notCompliantContent,
      derogatedContent: audit.derogatedContent,
      notInScopeContent: audit.notInScopeContent,

      errorCount: results.filter(
        (r) => r.status === CriterionResultStatus.NOT_COMPLIANT,
      ).length,

      blockingErrorCount: results.filter(
        (r) =>
          r.status === CriterionResultStatus.NOT_COMPLIANT &&
          r.userImpact === CriterionResultUserImpact.BLOCKING,
      ).length,

      totalCriteriaCount,

      applicableCriteriaCount: applicableCriteria.length,

      accessibilityRate,

      // FIXME: some of the return data is never asked to the user
      context: {
        auditorName: audit.auditorName,
        auditorEmail: audit.auditorEmail,
        desktopEnvironments: audit.environments
          .filter((e) => e.platform === 'desktop')
          .map((e) => ({
            operatingSystem: e.operatingSystem,
            operatingSystemVersion: e.operatingSystemVersion,
            assistiveTechnology: e.assistiveTechnology,
            assistiveTechnologyVersion: e.assistiveTechnologyVersion,
            browser: e.browser,
            browserVersion: e.browserVersion,
          })),
        mobileEnvironments: audit.environments
          .filter((e) => e.platform === 'mobile')
          .map((e) => ({
            operatingSystem: e.operatingSystem,
            operatingSystemVersion: e.operatingSystemVersion,
            assistiveTechnology: e.assistiveTechnology,
            assistiveTechnologyVersion: e.assistiveTechnologyVersion,
            browser: e.browser,
            browserVersion: e.browserVersion,
          })),
        referencial: 'RGAA Version 4.1',
        samples: audit.pages.map((p, i) => ({
          name: p.name,
          number: i + 1,
          url: p.url,
          id: p.id,
        })),
        tools: audit.tools.map((t) => ({
          name: t.name,
          function: t.function,
          url: t.url,
        })),
        technologies: audit.technologies,
      },

      pageDistributions: audit.pages.map((p) => ({
        name: p.name,
        compliant: {
          raw: results.filter(
            (r) =>
              r.pageId === p.id && r.status === CriterionResultStatus.COMPLIANT,
          ).length,
          percentage:
            (results.filter(
              (r) =>
                r.pageId === p.id &&
                r.status === CriterionResultStatus.COMPLIANT,
            ).length /
              totalCriteriaCount) *
            100,
        },
        notApplicable: {
          raw: results.filter(
            (r) =>
              r.pageId === p.id &&
              r.status === CriterionResultStatus.NOT_APPLICABLE,
          ).length,
          percentage:
            (results.filter(
              (r) =>
                r.pageId === p.id &&
                r.status === CriterionResultStatus.NOT_APPLICABLE,
            ).length /
              totalCriteriaCount) *
            100,
        },
        notCompliant: {
          raw: results.filter(
            (r) =>
              r.pageId === p.id &&
              r.status === CriterionResultStatus.NOT_COMPLIANT,
          ).length,
          percentage:
            (results.filter(
              (r) =>
                r.pageId === p.id &&
                r.status === CriterionResultStatus.NOT_COMPLIANT,
            ).length /
              totalCriteriaCount) *
            100,
        },
      })),

      resultDistribution: {
        compliant: {
          raw: compliantCriteria.length,
          percentage: (compliantCriteria.length / totalCriteriaCount) * 100,
        },
        notApplicable: {
          raw: notApplicableCriteria.length,
          percentage: (notApplicableCriteria.length / totalCriteriaCount) * 100,
        },
        notCompliant: {
          raw: notCompliantCriteria.length,
          percentage: (notCompliantCriteria.length / totalCriteriaCount) * 100,
        },
      },

      topicDistributions: RGAA.topics
        .map((t) => {
          const total = CRITERIA_BY_AUDIT_TYPE[audit.auditType].filter(
            (c) => c.topic === t.number,
          ).length;

          const compliantRaw = compliantCriteria.filter(
            (c) => c[0].topic === t.number,
          ).length;

          const notApplicableRaw = notApplicableCriteria.filter(
            (c) => c[0].topic === t.number,
          ).length;

          const notCompliantRaw = notCompliantCriteria.filter(
            (c) => c[0].topic === t.number,
          ).length;

          return {
            name: t.topic,
            compliant: {
              raw: compliantRaw,
              percentage: (compliantRaw / total) * 100,
            },
            notApplicable: {
              raw: notApplicableRaw,
              percentage: (notApplicableRaw / total) * 100,
            },
            notCompliant: {
              raw: notCompliantRaw,
              percentage: (notCompliantRaw / total) * 100,
            },
          };
        })
        // remove empty topics (for fast and complementary audits)
        .filter(
          (t) => t.compliant.raw + t.notApplicable.raw + t.notCompliant.raw > 0,
        ),

      results: results.map((r) => ({
        pageId: r.pageId,
        topic: r.topic,
        criterium: r.criterium,

        status: r.status,

        compliantComment: r.compliantComment,
        errorDescription: r.errorDescription,
        notApplicableComment: r.notApplicableComment,
        recommandation: r.recommandation,
        userImpact: r.userImpact,
      })),
    };

    return report;
  }

  async isAuditComplete(uniqueId: string): Promise<boolean> {
    const audit = await this.prisma.audit.findUnique({
      where: { editUniqueId: uniqueId },
      include: { pages: true },
    });

    const testedCount = await this.prisma.criterionResult.count({
      where: {
        page: {
          auditUniqueId: uniqueId,
        },
        criterium: {
          in: CRITERIA_BY_AUDIT_TYPE[audit.auditType].map((c) => c.criterium),
        },
        topic: {
          in: CRITERIA_BY_AUDIT_TYPE[audit.auditType].map((c) => c.topic),
        },
        status: {
          not: CriterionResultStatus.NOT_TESTED,
        },
      },
    });

    const expectedCount =
      CRITERIA_BY_AUDIT_TYPE[audit.auditType].length * audit.pages.length;

    return testedCount === expectedCount;
  }
}
