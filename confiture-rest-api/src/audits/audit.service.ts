import { Injectable } from '@nestjs/common';
import {
  Audit,
  CriterionResult,
  CriterionResultStatus,
  Prisma,
} from '@prisma/client';
import { nanoid } from 'nanoid';

import * as rgaa from '../rgaa.json';

import { PrismaService } from '../prisma.service';
import { CreateAuditDto } from './create-audit.dto';
import { UpdateAuditDto } from './update-audit.dto';

const AUDIT_EDIT_INCLUDE: Prisma.AuditInclude = {
  recipients: true,
  environments: true,
  pages: true,
};

const CRITERIA = rgaa.topics.flatMap((topic) =>
  topic.criteria.map((c) => ({
    topic: topic.number,
    criterium: c.criterium.number,
  })),
);
console.log('🚀 ~ file: audit.service.ts ~ line 20 ~ CRITERIA', CRITERIA);

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
  ): Promise<Omit<CriterionResult, 'id'>[]> {
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
}
