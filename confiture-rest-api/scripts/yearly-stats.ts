/** Calculate some yearly stats. */
import { Audit, AuditType, PrismaClient } from "@prisma/client";
import { AuditService } from "../src/audits/audit.service";

const EMAIL_BLACKLIST = [
  "etienne-dupont@example.com",
  "test@test.fr",
  "test@test.com",
  "test@gmail.com",
  "toto@toto.fr",
  "benoit.dequick@modernisation.gouv.fr",
  "adrien.muzyczka@modernisation.gouv.fr",
  "adrien.muzyczka@gmail.com"
];

// regexes to filter out emails with aliases
const EMAIL_BLACKLIST_REGEXES = EMAIL_BLACKLIST.map((email) => {
  const [username, domain] = email.split("@");
  return new RegExp(`${username}(\\+.+)?${domain}`);
});

const filterTestAudits = (audit: Pick<Audit, "auditorEmail">): boolean => !EMAIL_BLACKLIST_REGEXES.some((regex) => regex.test(audit.auditorEmail));

async function getStatsOnDateInterval(prisma: PrismaClient, startDate: Date, endDate: Date) {
  const createdAudits2024 = (await prisma.audit.findMany({
    where: {
      auditorEmail: {
        notIn: EMAIL_BLACKLIST
      },
      creationDate: {
        gte: startDate,
        lt: endDate
      }
    },
    select: {
      auditorEmail: true
    }
  })).filter(filterTestAudits).length;

  const createdFullAudits2024 = (await prisma.audit.findMany({
    where: {
      auditType: AuditType.FULL,
      auditorEmail: {
        notIn: EMAIL_BLACKLIST
      },
      creationDate: {
        gte: startDate,
        lt: endDate
      }
    },
    select: {
      auditorEmail: true
    }
  })).filter(filterTestAudits).length;

  const finishedFullAudits2024 = (await prisma.audit.findMany({
    where: {
      auditType: AuditType.FULL,
      auditorEmail: {
        notIn: EMAIL_BLACKLIST
      },
      publicationDate: {
        gte: startDate,
        lt: endDate
      }
    },
    select: {
      auditorEmail: true
    }
  })).filter(filterTestAudits).length;

  const auditsWithStatements2024 = (await prisma.audit.findMany({
    where: {
      auditorEmail: {
        notIn: EMAIL_BLACKLIST
      },
      publicationDate: {
        gte: startDate,
        lt: endDate
      },
      initiator: {
        not: null
      }
    },
    include: {
      pages: {
        include: {
          results: true
        }
      },
      transverseElementsPage: {
        include: { results: true }
      }
    }
  })).filter(filterTestAudits);

  const filledStatements2024 = auditsWithStatements2024.length;

  const auditRates = auditsWithStatements2024.map(audit => {
    const results = [audit.pages.map(p => p.results), audit.transverseElementsPage.results].flat(2);
    const { accessibilityRate } = AuditService.groupResultsByStatus(results, audit.transverseElementsPageId);
    return accessibilityRate;
  });

  const compliants2024 = auditRates.filter(r => r >= 100).length;
  const partiallyCompliants2024 = auditRates.filter(r => r >= 50 && r < 100).length;
  const notCompliant2024 = auditRates.filter(r => r < 50).length;

  return {
    createdAudits2024,
    createdFullAudits2024,
    finishedFullAudits2024,
    filledStatements2024,
    compliants2024,
    partiallyCompliants2024,
    notCompliant2024
  };
}

async function main() {
  const prisma = new PrismaClient();

  const stats2024 = await getStatsOnDateInterval(prisma, new Date("2024-01-01"), new Date("2025-01-01"));
  const stats2025 = await getStatsOnDateInterval(prisma, new Date("2025-01-01"), new Date("2026-01-01"));

  console.log(JSON.stringify({ stats2024, stats2025 }, null, 4));
}

main();
