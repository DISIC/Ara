import { Injectable } from '@nestjs/common';
import { nanoid } from 'nanoid';
import { PrismaService } from './prisma.service';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  createAudit() {
    return this.prisma.audit.create({
      data: {
        procedure: 'Ma procédure',
        uniqueId: nanoid(),
      },
    });
  }

  getAuditWithUniqueId(uniqueId: string) {
    return this.prisma.audit.findUnique({ where: { uniqueId } });
  }
}
