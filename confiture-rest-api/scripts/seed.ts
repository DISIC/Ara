import { PrismaClient } from "@prisma/client";

async function main() {
  const prisma = new PrismaClient();

  const editUniqueId = "edit-audit-1";
  const consultUniqueId = "consult-audit-1";

  const audit = await prisma.audit.create({
    data: {
      editUniqueId,
      consultUniqueId,
      auditTrace: {
        create: {
          auditConsultUniqueId: consultUniqueId,
          auditEditUniqueId: editUniqueId
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
    }
  });

  return audit;
}

main();
