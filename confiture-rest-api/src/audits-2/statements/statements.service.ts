import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma.service";
import { StatementResponseDto } from "./dto/statement-response.dto";
import { UpdateStatementRequestDto } from "./dto/update-statement-request.dto";

@Injectable()
export class StatementsService {
  constructor(private readonly prisma: PrismaService) {}

  async getStatement(
    auditEditUniqueId: string
  ): Promise<StatementResponseDto | null> {
    return await this.prisma.audit
      .findFirstOrThrow({
        where: {
          editUniqueId: auditEditUniqueId,
          isHidden: false
        }
      })
      .a11yStatement({
        include: {
          environments: true
        }
      });
  }

  async updateStatement(
    auditEditUniqueId: string,
    data: UpdateStatementRequestDto
  ): Promise<StatementResponseDto> {
    const audit = await this.prisma.audit.findUniqueOrThrow({
      where: { editUniqueId: auditEditUniqueId }
    });

    const statementData = {
      auditorOrganisation: data.auditorOrganisation,
      initiator: data.initiator,
      procedureUrl: data.procedureUrl,
      contactEmail: data.contactEmail,
      contactFormUrl: data.contactFormUrl,
      technologies: data.technologies,
      tools: data.tools,
      notCompliantContent: data.notCompliantContent,
      derogatedContent: data.derogatedContent,
      notInScopeContent: data.notInScopeContent,
      schemaPluriannuelUrl: data.schemaPluriannuelUrl,
      planActionUrl: data.planActionUrl
    };

    return await this.prisma.a11yStatement.upsert({
      where: {
        auditId: audit.id
      },
      create: {
        audit: { connect: { id: audit.id } },
        ...statementData,
        statementPublicationDate: new Date(),
        environments: {
          createMany: {
            data: data.environments
          }
        }
      },
      update: {
        ...statementData,
        statementEditionDate: new Date(),
        environments: {
          // delete every environments and recreate them
          deleteMany: {},
          createMany: { data: data.environments }
        }
      },
      include: {
        environments: true
      }
    });
  }

  // TODO: call on any result status change
  async updateStatementDate(uniqueId: string) {
    await this.prisma.audit.update({
      where: { editUniqueId: uniqueId },
      data: {
        a11yStatement: {
          update: {
            data: {
              statementEditionDate: new Date()
            }
          }
        }
      }
    });
  }
}
