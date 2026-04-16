import { Body, Controller, Post } from "@nestjs/common";
import { ApiCreatedResponse, ApiTags } from "@nestjs/swagger";
import { nanoid } from "nanoid";
import { CRITERIA } from "../audits/criteria";
import { AuditDto } from "../audits/dto/entities/audit.dto";
import { AUDIT_PRISMA_SELECT } from "../audits/prisma-selects";
import {
  CriterionResultStatus,
  CriterionResultUserImpact
} from "../generated/prisma/client";
import { PrismaService } from "../prisma.service";
import { CreateDebugAuditDto } from "./create-debug-audit.dto";

@Controller("debug")
@ApiTags("Debug")
export class DebugController {
  constructor(
    private readonly prisma: PrismaService
  ) {}

  @Post("create-audit")
  @ApiCreatedResponse({
    description: "The debug audit has been successfully created.",
    type: AuditDto
  })
  async createAudit(
    @Body() body: CreateDebugAuditDto
  ): Promise<AuditDto> {
    const editUniqueId = nanoid();
    const reportUniqueId = nanoid();

    const result = await this.prisma.$transaction(async (tx) => {
      const audit = await tx.audit.create({
        data: {
          editUniqueId: editUniqueId,
          consultUniqueId: reportUniqueId,
          creationDate: new Date(),
          publicationDate: body.isComplete ? new Date() : null,
          auditTrace: {
            create: {
              auditConsultUniqueId: editUniqueId,
              auditEditUniqueId: reportUniqueId
            }
          },
          auditType: body.auditType,
          procedureName: body.procedureName,
          auditorEmail: body.auditorEmail,
          auditorName: "Étienne Durand",
          transverseElementsPage: {
            create: {
              name: "Éléments transverses",
              url: "",
              slug: "elements-transverses"
            }
          },
          pages: {
            createMany: {
              data: [
                {
                  name: "Accueil",
                  url: "https://example.com",
                  slug: "accueil"
                },
                {
                  name: "Contact",
                  url: "https://example.com/contact",
                  slug: "contact"
                }
              ]
            }
          },

          ...(body.fillStatement && {
            statementPublicationDate: new Date(),
            initiator: "Mairie de Poueton-les-Bains",
            auditorOrganisation: "2 devs, 1 Odette",
            procedureUrl: "https://example.com",
            contactEmail: "help@example.com",
            contactFormUrl: "https://example.com/contact",
            technologies: ["HTML", "CSS", "JavaScript"],
            tools: ["Axe devtools", "Lighthouse"],
            environments: {
              createMany: {
                data: [
                  {
                    platform: "Ordinateur",
                    operatingSystem: "MacOS",
                    assistiveTechnology: "VoiceOver",
                    browser: "Safari"
                  }
                ]
              }
            }
          })
        },
        select: AUDIT_PRISMA_SELECT
      });

      if (!body.isPristine) {
        await Promise.all(
          [audit.transverseElementsPage, ...audit.pages].map(async (p) =>
            tx.criterionResult.createMany({
              data: CRITERIA.map((c, i) => ({
                status: [
                  CriterionResultStatus.COMPLIANT,
                  CriterionResultStatus.NOT_APPLICABLE,
                  CriterionResultStatus.NOT_COMPLIANT
                ][i % 3],
                notCompliantComment: "Une erreur ici",
                notApplicableComment: "Attention quand même si ça devient applicable",
                compliantComment: "Peut mieux faire",
                quickWin: i % 7 === 0,
                userImpact: [
                  CriterionResultUserImpact.MINOR,
                  CriterionResultUserImpact.MAJOR,
                  CriterionResultUserImpact.BLOCKING,
                  null
                ][i % 4],
                topic: c.topic,
                criterium: c.criterium,
                pageId: p.id
              }))
            })
          )
        );
      }

      if (!body.isComplete && !body.isPristine) {
        await tx.criterionResult.delete({
          where: {
            pageId_topic_criterium: {
              topic: 1,
              criterium: 1,
              pageId: audit.pages[0].id
            }
          }
        });
      }

      return audit;
    });

    return result;
  }
}
