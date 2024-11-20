import { PrismaClient, Prisma } from "@prisma/client";

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

  await prisma.audit.create({
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
}

main();
