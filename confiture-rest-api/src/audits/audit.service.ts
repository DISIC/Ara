import { Injectable } from '@nestjs/common';
import type { Audit, Prisma } from '@prisma/client';
import { nanoid } from 'nanoid';

import { PrismaService } from '../prisma.service';
import { CreateAuditDto } from './create-audit.dto';
import { UpdateAuditDto } from './update-audit.dto';

const AUDIT_EDIT_INCLUDE: Prisma.AuditInclude = {
  recipients: true,
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
