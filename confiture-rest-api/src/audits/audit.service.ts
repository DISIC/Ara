import { Injectable } from '@nestjs/common';
import {
  Audit,
  AuditedPage,
  AuditType,
  CriterionResult,
  CriterionResultStatus,
  CriterionResultUserImpact,
  Prisma,
  TestEnvironment,
} from '@prisma/client';
import { nanoid } from 'nanoid';

import { PrismaService } from '../prisma.service';
import { AuditReportDto } from './audit-report.dto';
import { CreateAuditDto } from './create-audit.dto';
import { CRITERIA } from './criteria';
import { UpdateAuditDto } from './update-audit.dto';
import { UpdateResultsDto } from './update-results.dto';
import * as RGAA from '../rgaa.json';

const AUDIT_EDIT_INCLUDE: Prisma.AuditInclude = {
  recipients: true,
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
        procedureUrl: data.procedureUrl,

        initiator: data.initiator,

        auditorEmail: data.auditorEmail,
        auditorName: data.auditorName,

        contactName: data.contactName,
        contactEmail: data.contactEmail,
        contactFormUrl: data.contactFormUrl,

        recipients: {
          createMany: {
            data: data.recipients,
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
    const pages = await this.prisma.auditedPage.findMany({
      where: { auditUniqueId: uniqueId },
    });

    const existingResults = await this.prisma.criterionResult.findMany({
      where: {
        page: {
          auditUniqueId: uniqueId,
        },
      },
    });

    // We do not create every empty criterion result rows in the db when creating pages.
    // Instead we return the results in the database and fill missing criteria with placeholder data.
    return pages.flatMap((page) =>
      CRITERIA.map((criterion) => {
        const existingResult = existingResults.find(
          (result) =>
            result.pageUrl === page.url &&
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
          pageUrl: page.url,
        };
      }),
    );
  }

  async updateAudit(
    uniqueId: string,
    data: UpdateAuditDto,
  ): Promise<Audit | undefined> {
    try {
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

            recipients: {
              deleteMany: {
                email: {
                  notIn: data.recipients.map((r) => r.email),
                },
              },

              // create or update recipients
              upsert: data.recipients.map((recipient) => ({
                where: {
                  email_auditUniqueId: {
                    auditUniqueId: uniqueId,
                    email: recipient.email,
                  },
                },
                create: recipient,
                update: recipient,
              })),
            },

            // step 2
            auditType: data.auditType,
            auditTools: data.auditTools,
            environments: {
              deleteMany: {
                OR: [
                  {
                    assistiveTechnology: {
                      notIn: data.environments.map(
                        (e) => e.assistiveTechnology,
                      ),
                    },
                  },
                  {
                    browser: {
                      notIn: data.environments.map((e) => e.browser),
                    },
                  },
                  {
                    platform: {
                      notIn: data.environments.map((e) => e.platform),
                    },
                  },
                ],
              },
              upsert: data.environments.map((environment) => ({
                where: {
                  platform_assistiveTechnology_browser_auditUniqueId: {
                    auditUniqueId: uniqueId,
                    assistiveTechnology: environment.assistiveTechnology,
                    browser: environment.browser,
                    platform: environment.platform,
                  },
                },
                create: environment,
                update: environment,
              })),
            },
            pages: {
              deleteMany: {
                url: {
                  notIn: data.pages.map((p) => p.url),
                },
              },
              upsert: data.pages.map((page) => ({
                where: {
                  url_auditUniqueId: {
                    auditUniqueId: uniqueId,
                    url: page.url,
                  },
                },
                create: page,
                update: page,
              })),
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
            url_auditUniqueId: {
              auditUniqueId: uniqueId,
              url: item.pageUrl,
            },
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
          auditUniqueId_pageUrl_topic_criterium: {
            auditUniqueId: uniqueId,
            criterium: item.criterium,
            pageUrl: item.pageUrl,
            topic: item.topic,
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
    })) as Audit & { environments: TestEnvironment[]; pages: AuditedPage[] };

    if (!audit) {
      return;
    }

    const results = await this.prisma.criterionResult.findMany({
      where: {
        auditUniqueId: audit.editUniqueId,
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

    const compliantCriteria = applicableCriteria.filter((criteria) =>
      criteria.every(
        (c) =>
          c.status === CriterionResultStatus.COMPLIANT ||
          c.status === CriterionResultStatus.NOT_APPLICABLE,
      ),
    );

    const accessibilityRate = Math.round(
      (compliantCriteria.length / applicableCriteria.length) * 100,
    );

    const report: AuditReportDto = {
      consultUniqueId: audit.consultUniqueId,

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

      // TODO: take audit type into account in generation steps
      // totalCriteriaCount: {
      //   [AuditType.FULL]: 106,
      //   [AuditType.COMPLEMENTARY]: 50,
      //   [AuditType.FAST]: 25,
      // }[audit.auditType],
      totalCriteriaCount: 106,

      applicableCriteriaCount: applicableCriteria.length,

      accessibilityRate,

      // FIXME: some of the return data is never asked to the user
      context: {
        auditorName: audit.auditorName,
        desktopEnvironments: audit.environments
          .filter((e) => e.platform === 'desktop')
          .map((e) => ({
            assistiveTechnology: e.assistiveTechnology,
            browser: e.browser,
            os: 'Windows 11',
          })),
        mobileEnvironments: audit.environments
          .filter((e) => e.platform === 'mobile')
          .map((e) => ({
            assistiveTechnology: e.assistiveTechnology,
            browser: e.browser,
            os: 'Android 12',
          })),
        referencial: 'RGAA Version 4.1',
        samples: audit.pages.map((p, i) => ({
          name: p.name,
          number: i + 1,
          url: p.url,
        })),

        technologies: ['HTML', 'CSS', 'Javascript'],
        tools: audit.auditTools.map((t) => ({
          name: t,
          function: 'Todo',
          url: 'https://example.com',
        })),
      },

      // TODO: should the distribution be calculated by criteria accross all pages or individually ?
      // TODO: update total criteria count for percentages (106)
      pageDistributions: audit.pages.map((p) => ({
        name: p.name,
        compliant: {
          raw: results.filter(
            (r) =>
              r.pageUrl === p.url &&
              r.status === CriterionResultStatus.COMPLIANT,
          ).length,
          percentage: Math.round(
            (results.filter(
              (r) =>
                r.pageUrl === p.url &&
                r.status === CriterionResultStatus.COMPLIANT,
            ).length /
              106) *
              100,
          ),
        },
        notApplicable: {
          raw: results.filter(
            (r) =>
              r.pageUrl === p.url &&
              r.status === CriterionResultStatus.NOT_APPLICABLE,
          ).length,
          percentage: Math.round(
            (results.filter(
              (r) =>
                r.pageUrl === p.url &&
                r.status === CriterionResultStatus.NOT_APPLICABLE,
            ).length /
              106) *
              100,
          ),
        },
        notCompliant: {
          raw: results.filter(
            (r) =>
              r.pageUrl === p.url &&
              r.status === CriterionResultStatus.NOT_COMPLIANT,
          ).length,
          percentage: Math.round(
            (results.filter(
              (r) =>
                r.pageUrl === p.url &&
                r.status === CriterionResultStatus.NOT_COMPLIANT,
            ).length /
              106) *
              100,
          ),
        },
      })),

      resultDistribution: {
        compliant: {
          raw: results.filter(
            (r) => r.status === CriterionResultStatus.COMPLIANT,
          ).length,
          percentage: Math.round(
            (results.filter((r) => r.status === CriterionResultStatus.COMPLIANT)
              .length /
              results.length) *
              100,
          ),
        },
        notApplicable: {
          raw: results.filter(
            (r) => r.status === CriterionResultStatus.NOT_APPLICABLE,
          ).length,
          percentage: Math.round(
            (results.filter(
              (r) => r.status === CriterionResultStatus.NOT_APPLICABLE,
            ).length /
              results.length) *
              100,
          ),
        },
        notCompliant: {
          raw: results.filter(
            (r) => r.status === CriterionResultStatus.NOT_COMPLIANT,
          ).length,
          percentage: Math.round(
            (results.filter(
              (r) => r.status === CriterionResultStatus.NOT_COMPLIANT,
            ).length /
              results.length) *
              100,
          ),
        },
      },

      topicDistributions: RGAA.topics.map((t) => ({
        name: t.topic,
        compliant: {
          raw: results.filter(
            (r) =>
              r.topic === t.number &&
              r.status === CriterionResultStatus.COMPLIANT,
          ).length,
          percentage: Math.round(
            (results.filter(
              (r) =>
                r.topic === t.number &&
                r.status === CriterionResultStatus.COMPLIANT,
            ).length /
              results.filter((r) => r.topic === t.number).length) *
              100,
          ),
        },
        notApplicable: {
          raw: results.filter(
            (r) =>
              r.topic === t.number &&
              r.status === CriterionResultStatus.NOT_APPLICABLE,
          ).length,
          percentage: Math.round(
            (results.filter(
              (r) =>
                r.topic === t.number &&
                r.status === CriterionResultStatus.NOT_APPLICABLE,
            ).length /
              results.filter((r) => r.topic === t.number).length) *
              100,
          ),
        },
        notCompliant: {
          raw: results.filter(
            (r) =>
              r.topic === t.number &&
              r.status === CriterionResultStatus.NOT_COMPLIANT,
          ).length,
          percentage: Math.round(
            (results.filter(
              (r) =>
                r.topic === t.number &&
                r.status === CriterionResultStatus.NOT_COMPLIANT,
            ).length /
              results.filter((r) => r.topic === t.number).length) *
              100,
          ),
        },
      })),

      results: results.map((r) => ({
        pageUrl: r.pageUrl,
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
    const notTestedCount = await this.prisma.criterionResult.count({
      where: {
        auditUniqueId: uniqueId,
        status: CriterionResultStatus.NOT_TESTED,
      },
    });

    return notTestedCount === 0;
  }
}
