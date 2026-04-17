import { hash } from "bcrypt";
import { CRITERIA } from "src/audits/criteria";
import { AuditType, CriterionResultStatus, CriterionResultUserImpact } from "src/generated/prisma/client";

// Accounts (email / password) based on `DATABASE_SEEDS` env variable
export async function getRawAccounts() {
  return await Promise.all(process.env.DATABASE_SEEDS.split(",").map(async acc => {
    const [email, rawPassword] = acc.split(":");

    if (!email || !rawPassword) {
      throw new Error("Wrong seeds configuration (expected format: email:password");
    }

    return {
      email,
      password: await hash(rawPassword, 10)
    };
  }));
}

// 8 audits with 4 completed
export const rawAudits = [
  {
    creationDate: new Date(),
    auditType: AuditType.FULL,
    procedureName: "106 en cours",
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
    }
  },
  {
    creationDate: new Date(),
    auditType: AuditType.FULL,
    procedureName: "106 en cours avec déclaration",
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
    statementPublicationDate: new Date(),
    initiator: "Mairie de Paris",
    auditorOrganisation: "Ara Corp.",
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
  },
  {
    creationDate: new Date(),
    auditType: AuditType.FAST,
    procedureName: "25 en cours",
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
    }
  },
  {
    creationDate: new Date(),
    auditType: AuditType.COMPLEMENTARY,
    procedureName: "50 en cours",
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
    }
  },
  {
    creationDate: new Date(),
    publicationDate: new Date(),
    auditType: AuditType.FULL,
    procedureName: "106 terminé",
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
    }
  },
  {
    creationDate: new Date(),
    publicationDate: new Date(),
    auditType: AuditType.FULL,
    procedureName: "106 terminé avec déclaration",
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
    statementPublicationDate: new Date(),
    initiator: "Mairie de Paris",
    auditorOrganisation: "Ara Corp.",
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
  },
  {
    creationDate: new Date(),
    publicationDate: new Date(),
    auditType: AuditType.FAST,
    procedureName: "25 terminé",
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
    }
  },
  {
    creationDate: new Date(),
    publicationDate: new Date(),
    auditType: AuditType.COMPLEMENTARY,
    procedureName: "50 terminé",
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
    }
  }

];

// Results for completed audits
export const rawCriteria = CRITERIA.map((c, i) => ({
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
  criterium: c.criterium
}));
