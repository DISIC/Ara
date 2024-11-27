import {
  PrismaClient,
  Prisma,
  CriterionResultStatus,
  CriterionResultUserImpact
} from "@prisma/client";
import { CRITERIA } from "../src/audits/criteria";

async function main() {
  const prisma = new PrismaClient();

  const auditData: Omit<
    Prisma.AuditCreateInput,
    "editUniqueId" | "consultUniqueId" | "auditTrace"
  > = {
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
  };

  // EDITION AUDIT
  const editAuditIdEdition = "edit-audit-edition";
  const consultUniqueIdEdition = "consult-audit-edition";

  const editionAudit = await prisma.audit.create({
    data: {
      editUniqueId: editAuditIdEdition,
      consultUniqueId: consultUniqueIdEdition,
      auditTrace: {
        create: {
          auditConsultUniqueId: editAuditIdEdition,
          auditEditUniqueId: consultUniqueIdEdition
        }
      },
      ...auditData
    },
    include: {
      transverseElementsPage: true
    }
  });

  const editionAuditPages = await prisma.auditedPage.findMany({
    where: {
      auditUniqueId: editAuditIdEdition
    }
  });

  await Promise.all(
    [editionAudit.transverseElementsPage, ...editionAuditPages].map(async (p) =>
      prisma.criterionResult.createMany({
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

  await prisma.criterionResult.delete({
    where: {
      pageId_topic_criterium: {
        topic: 1,
        criterium: 1,
        pageId: editionAuditPages[0].id
      }
    }
  });

  // DELETION AUDIT
  const editAuditIdDeletion = "edit-audit-deletion";
  const consultUniqueIdDeletion = "consult-audit-deletion";

  await prisma.audit.create({
    data: {
      editUniqueId: editAuditIdDeletion,
      consultUniqueId: consultUniqueIdDeletion,
      auditTrace: {
        create: {
          auditConsultUniqueId: editAuditIdDeletion,
          auditEditUniqueId: consultUniqueIdDeletion
        }
      },
      ...auditData
    }
  });

  // COMPLETED AUDIT
  const editAuditIdCompletion = "edit-audit-completion";
  const consultUniqueIdCompletion = "consult-audit-completion";

  const completedAudit = await prisma.audit.create({
    data: {
      editUniqueId: editAuditIdCompletion,
      consultUniqueId: consultUniqueIdCompletion,
      auditTrace: {
        create: {
          auditConsultUniqueId: editAuditIdCompletion,
          auditEditUniqueId: consultUniqueIdCompletion
        }
      },
      ...auditData
    },
    include: {
      transverseElementsPage: true
    }
  });

  const completedAuditPages = await prisma.auditedPage.findMany({
    where: {
      auditUniqueId: editAuditIdCompletion
    }
  });

  await Promise.all(
    [completedAudit.transverseElementsPage, ...completedAuditPages].map(
      async (p) =>
        prisma.criterionResult.createMany({
          data: CRITERIA.map((c, i) => ({
            status: [
              CriterionResultStatus.COMPLIANT,
              CriterionResultStatus.NOT_APPLICABLE,
              CriterionResultStatus.NOT_COMPLIANT
            ][i % 3],
            notCompliantComment: "Une erreur ici",
            notApplicableComment:
              "Attention quand même si ça devient applicable",
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

main();
