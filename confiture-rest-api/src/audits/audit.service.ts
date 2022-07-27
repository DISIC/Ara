import { Injectable } from '@nestjs/common';
import { nanoid } from 'nanoid';
import { PrismaService } from '../prisma.service';
import { CreateAuditDto } from './create-audit.dto';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  createAudit(data: CreateAuditDto) {
    return this.prisma.audit.create({
      data: {
        editUniqueId: nanoid(),
        consultUniqueId: nanoid(),

        procedure: data.procedure,
        url: data.procedureUrl,

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
      include: {
        recipients: true,
      },
    });
  }

  getAuditWithConsultUniqueId(uniqueId: string) {
    return this.prisma.audit.findUnique({
      where: { consultUniqueId: uniqueId },
    });
  }

  getAuditWithEditUniqueId(uniqueId: string) {
    return this.prisma.audit.findUnique({ where: { editUniqueId: uniqueId } });
  }
}
