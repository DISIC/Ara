import {
  PrismaClient,
  CriterionResultStatus,
  CriterionResultUserImpact
} from "@prisma/client";
import { CRITERIA } from "../src/audits/criteria";
import { nanoid } from "nanoid";

// Create a test audit and return its `editId` and `reportId`.
async function main() {
  const isComplete = process.argv.includes("--complete");
  const hasNoImprovementsComments = process.argv.includes("--no-impr");

  const prisma = new PrismaClient();

  const editUniqueId = `edit-${nanoid()}`;
  const reportUniqueId = `report-${nanoid()}`;

  const completedAudit = await prisma.audit.create({
    data: {
      editUniqueId: editUniqueId,
      consultUniqueId: reportUniqueId,
      publicationDate: isComplete ? new Date() : null,
      auditTrace: {
        create: {
          auditConsultUniqueId: editUniqueId,
          auditEditUniqueId: reportUniqueId
        }
      },
      auditType: "FULL",
      procedureName: "Audit de mon petit site",
      auditorEmail: "etienne.durand@example.com",
      auditorName: "Étienne Durand",
      transverseElementsPage: {
        create: {
          name: "Éléments transverses",
          url: ""
        }
      },
      pages: {
        createMany: {
          data: [
            {
              name: "Accueil",
              url: "https://example.com"
            },
            {
              name: "Contact",
              url: "https://example.com/contact"
            },
            {
              name: "À propos",
              url: "https://example.com/a-propos"
            },
            {
              name: "Blog",
              url: "https://example.com/blog"
            },
            {
              name: "Article",
              url: "https://example.com/blog/article"
            },
            {
              name: "Connexion",
              url: "https://example.com/connexion"
            },
            {
              name: "Documentation",
              url: "https://example.com/documentation"
            },
            {
              name: "FAQ",
              url: "https://example.com/faq"
            }
          ]
        }
      }
    },
    include: {
      transverseElementsPage: true
    }
  });

  const auditPages = await prisma.auditedPage.findMany({
    where: {
      auditUniqueId: editUniqueId
    }
  });

  await Promise.all(
    [completedAudit.transverseElementsPage, ...auditPages].map(async (p) =>
      prisma.criterionResult.createMany({
        data: CRITERIA.map((c, i) => ({
          status: [
            CriterionResultStatus.COMPLIANT,
            CriterionResultStatus.NOT_APPLICABLE,
            CriterionResultStatus.NOT_COMPLIANT
          ][i % 3],
          notCompliantComment: "Une erreur ici",
          notApplicableComment: hasNoImprovementsComments
            ? null
            : "Attention quand même si ça devient applicable",
          compliantComment: hasNoImprovementsComments
            ? null
            : "Peut mieux faire",
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

  if (!isComplete) {
    await prisma.criterionResult.delete({
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

// Allows calling Cypress command to retrieve data as parsed JSON.
main().then((result) => console.log(JSON.stringify(result)));
