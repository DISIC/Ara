import { Injectable } from '@nestjs/common';
import {
  Audit,
  CriterionResult,
  CriterionResultStatus,
  Prisma,
} from '@prisma/client';
import { nanoid } from 'nanoid';

import { PrismaService } from '../prisma.service';
import { CreateAuditDto } from './create-audit.dto';
import { CRITERIA } from './criteria';
import { UpdateAuditDto } from './update-audit.dto';
import { UpdateResultsDto } from './update-results.dto';

const AUDIT_EDIT_INCLUDE: Prisma.AuditInclude = {
  recipients: true,
  environments: true,
  pages: true,
};

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  createAudit(data: CreateAuditDto) {
    return this.prisma.audit.create({
      data: {
        editUniqueId: nanoid(),
        consultUniqueId: nanoid(),

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
      return await this.prisma.audit.update({
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
                    notIn: data.environments.map((e) => e.assistiveTechnology),
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
        },
        include: AUDIT_EDIT_INCLUDE,
      });
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
    const item = body.data[0];

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

    await this.prisma.criterionResult.upsert({
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
  }
}
