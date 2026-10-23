import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma.service";
import { StatementResponseDto } from "./dto/statement-response.dto";

@Injectable()
export class StatementsService {
  constructor(
    private readonly prisma: PrismaService
  ) { }

  getStatement(auditEditUniqueId: string): Promise<StatementResponseDto | null> {
    // make sure the audit exists
    return this.prisma.audit.findFirstOrThrow({
      where: {
        editUniqueId: auditEditUniqueId,
        isHidden: false
      }
    })
      // before fetching its statement using prisma’s "fluent" API
      .a11yStatement({
        include: {
          environments: true
        }
      });
  }
}
