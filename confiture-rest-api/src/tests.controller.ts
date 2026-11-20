import { Body, Controller, Post } from "@nestjs/common";
import { nanoid } from "nanoid";
import { CRITERIA } from "./audits/criteria";
import { AuthService } from "./auth/auth.service";
import {
  AuditReference,
  CriterionResultStatus,
  CriterionResultUserImpact
} from "./generated/prisma/client";
import { PrismaService } from "./prisma.service";
import { slugify } from "./utils";

const ALL_USER_IMPACTS = [
  CriterionResultUserImpact.MINOR,
  CriterionResultUserImpact.MAJOR,
  CriterionResultUserImpact.BLOCKING,
  null
];

const NOT_BLOCKING_USER_IMPACTS = [
  CriterionResultUserImpact.MINOR,
  CriterionResultUserImpact.MAJOR,
  null
];

/**
 * Statuses for each criterion, so that the audit gets the wanted compliance rate
 * (compliant / (compliant + not compliant), not applicable excluded).
 * - 100: only compliant or not applicable
 * - 99: exactly one not compliant
 * - other: more compliant than the rate asked
 * - undefined: cycle through all statuses
 */
function buildStatuses(
  total: number,
  complianceRate?: number
): CriterionResultStatus[] {
  if (complianceRate === undefined) {
    return Array.from(
      { length: total },
      (_, i) =>
        [
          CriterionResultStatus.COMPLIANT,
          CriterionResultStatus.NOT_APPLICABLE,
          CriterionResultStatus.NOT_COMPLIANT
        ][i % 3]
    );
  }

  // One criterion out of three is not applicable, others are applicable
  const statuses = Array.from<unknown, CriterionResultStatus>({ length: total }, (_, i) =>
    i % 3 === 2
      ? CriterionResultStatus.NOT_APPLICABLE
      : CriterionResultStatus.COMPLIANT);

  const applicableIndexes = statuses.flatMap((s, i) =>
    s === CriterionResultStatus.COMPLIANT ? [i] : []
  );

  const notCompliantCount =
    complianceRate >= 100
      ? 0
      : Math.max(
          1,
          Math.floor((applicableIndexes.length * (100 - complianceRate)) / 100)
        );

  for (const i of applicableIndexes.slice(0, notCompliantCount)) {
    statuses[i] = CriterionResultStatus.NOT_COMPLIANT;
  }

  return statuses;
}

/**
 * At 99%, the only not compliant criterion is blocking (RGAA 5 non-compliant).
 * Otherwise, no blocking user impact.
 */
function getUserImpact(
  index: number,
  auditReference: AuditReference,
  complianceRate?: number
): CriterionResultUserImpact | null {
  if (complianceRate === 99) {
    return CriterionResultUserImpact.BLOCKING;
  }

  return complianceRate === undefined || auditReference === AuditReference.RGAA_4
    ? ALL_USER_IMPACTS[index % 4]
    : NOT_BLOCKING_USER_IMPACTS[index % 3];
}

@Controller("tests")
export class TestsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auth: AuthService
  ) {}

  @Post("verification-token")
  async getAccountVerificationToken(@Body() body: { username: string }) {
    const token = this.auth.regenerateVerificationToken(body.username);
    return token;
  }

  @Post("password-reset-verification-token")
  async getPasswordResetVerificationToken(@Body() body: { username: string }) {
    const token = this.auth.generatePasswordResetVerificationToken(
      body.username
    );

    return token;
  }

  @Post("email-update-verification-token")
  async getEmailUpdateVerificationToken(@Body() body: { uid: string }) {
    const token = this.auth.regenerateEmailUpdateVerificationToken(body.uid);

    return token;
  }

  @Post("create-verified-user")
  async createVerifiedUser() {
    const email = `john-doe${Math.random()}@example.com`;
    const password = "pouetpouetpouet";

    await this.auth.createUnverifiedUser(email, password);
    const user = await this.prisma.user.update({
      data: {
        isVerified: true,
        verificationJti: null
      },
      where: {
        username: email
      }
    });

    const authToken = await this.auth.signin(email, password);

    return {
      username: email,
      password,
      authToken,
      uid: user.uid
    };
  }

  @Post("create-audit")
  async createAudit(
    @Body()
    body: {
      isComplete: boolean;
      isPristine: boolean;
      noImprovements: boolean;
      auditorEmail?: string;
      fillStatement?: boolean;
      publicationDate?: Date;
      auditReference?: AuditReference;
      complianceRate?: number;
    }
  ) {
    const editUniqueId = `edit-${nanoid()}`;
    const reportUniqueId = `report-${nanoid()}`;

    const completedAudit = await this.prisma.audit.create({
      data: {
        editUniqueId: editUniqueId,
        consultUniqueId: reportUniqueId,
        creationDate: new Date(),
        publicationDate: body.isComplete ?
            (body.publicationDate ? new Date(body.publicationDate) : new Date())
          : null,
        auditTrace: {
          create: {
            auditConsultUniqueId: reportUniqueId,
            auditEditUniqueId: editUniqueId
          }
        },
        auditType: "FULL",
        auditReference: body.auditReference ?? AuditReference.RGAA_4,
        procedureName: "Audit de mon petit site",
        auditor: {
          connectOrCreate: {
            create: {
              username: body.auditorEmail || "etienne.durand@example.com"
            },
            where: {
              username: body.auditorEmail || "etienne.durand@example.com"
            }
          }
        },
        auditorName: "Étienne Durand",
        transverseElementsPage: {
          create: {
            name: "Éléments transverses",
            url: "",
            slug: "elements-transverses",
            order: -1
          }
        },
        pages: {
          createMany: {
            data: [
              {
                name: "Accueil",
                url: "https://example.com",
                slug: slugify("Accueil")
              },
              {
                name: "Contact",
                url: "https://example.com/contact",
                slug: slugify("Contact")
              },
              {
                name: "À propos",
                url: "https://example.com/a-propos",
                slug: slugify("À propos")
              },
              {
                name: "Blog",
                url: "https://example.com/blog",
                slug: slugify("Blog")
              },
              {
                name: "Article",
                url: "https://example.com/blog/article",
                slug: slugify("Article")
              },
              {
                name: "Connexion",
                url: "https://example.com/connexion",
                slug: slugify("Connexion")
              },
              {
                name: "Documentation",
                url: "https://example.com/documentation",
                slug: slugify("Documentation")
              },
              {
                name: "FAQ",
                url: "https://example.com/faq",
                slug: slugify("FAQ")
              }
            ].map((p, i) => ({ ...p, order: i }))
          }
        },

        ...(body.fillStatement && {
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
      include: {
        transverseElementsPage: true
      }
    });

    const auditPages = await this.prisma.auditedPage.findMany({
      where: {
        auditUniqueId: editUniqueId
      }
    });

    if (!body.isPristine) {
      const statuses = buildStatuses(CRITERIA.length, body.complianceRate);

      await Promise.all(
        [completedAudit.transverseElementsPage, ...auditPages].flatMap((p) =>

          CRITERIA.map((c, i) => {
            const status = statuses[i];
            const userImpact = getUserImpact(i, body.auditReference, body.complianceRate);

            return this.prisma.criterionResult.create({
              data: {
                status,
                notApplicableComment: body.noImprovements || status !== CriterionResultStatus.NOT_APPLICABLE
                  ? null
                  : "Attention quand même si ça devient applicable",
                compliantComment: body.noImprovements || status !== CriterionResultStatus.COMPLIANT ? null : "Peut mieux faire",
                notCompliantItems: status === CriterionResultStatus.NOT_COMPLIANT
                  ? {
                      create: {
                        title: `Titre de l’erreur`,
                        comment: `Une erreur ici`,
                        quickWin: i % 7 === 0,
                        userImpact
                      }
                    }
                  : undefined,
                topic: c.topic,
                criterium: c.criterium,
                pageId: p.id
              }
            });
          })
        )
      );
    }
    else {
      const criteria = CRITERIA[0];

      await this.prisma.criterionResult.create({
        data: {
          status: CriterionResultStatus.NOT_COMPLIANT,
          notCompliantItems: {
            create: {
              title: `Titre de l’erreur`
            }
          },

          topic: criteria.topic,
          criterium: criteria.criterium,
          pageId: completedAudit.transverseElementsPage.id
        }
      });
    }

    if (!body.isComplete && !body.isPristine && auditPages.length > 0) {
      await this.prisma.criterionResult.delete({
        where: {
          pageId_topic_criterium: {
            topic: 1,
            criterium: 1,
            pageId: auditPages[0].id
          }
        }
      });
    }

    return {
      editId: editUniqueId,
      reportId: reportUniqueId
    };
  }
}
